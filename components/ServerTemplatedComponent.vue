<script>
/**
 * Converts a CamelCase tag name into a snake-case tag name.
 *
 * @param tagName {string}
 * @return {string}
 */
export function camelToSnake(tagName) {
    return tagName
        .split(/(?=[A-Z])/)
        .filter((x) => x)
        .join("-")
        .toLowerCase();
}

/**
 * The extractContent expects a function that returns a DOM element from a full
 * document. This generates such a function which will extract content based
 * on a CSS selector.
 *
 * @param selector {string}
 * @return {function(*): *}
 */
export function extractSelector(selector) {
    return (dom) => dom.querySelector(selector);
}

/**
 * Converts HTML source code into DOM-like content.
 *
 * On the server this uses the JSDOM lib while on the browser it uses the real
 * DOM API.
 *
 * @param html {string} HTML code you want to parse
 * @return {Document}
 */
function htmlToDom(html) {
    if (process.browser) {
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
    } else {
        const { JSDOM } = require("jsdom");
        const { document: mockDocument } = new JSDOM(html).window;
        return mockDocument;
    }
}

export default {
    props: {
        /**
         * HTML content to derive templates from
         */
        content: {
            type: String,
            required: true,
        },

        /**
         * Components definitions
         */
        componentsDefs: {
            type: Object,
            required: true,
        },

        /**
         * A function to extract the content from the parsed DOM. You can import
         * extractSelector() and use it from the calling side. By default, it
         * will extract the body.
         */
        extractContent: {
            type: Function,
            default: extractSelector("body"),
        },
    },

    computed: {
        /**
         * In a nutshell, generates the templates for the various components.
         *
         * In truth, that's not so simple.
         *
         * 0. The content is parsed into DOM and the node containing the content
         *    is extracted so that we can work on it
         * 1. Every single component definition passed as prop should include a
         *    `selector` property which indicates what CSS selector this
         *    component should take over. All selected elements are flagged
         *    to be "componentized".
         * 2. There is a few fun considerations:
         *      - Components can appear several times with different templates
         *      - Components can include other components
         *      - We want to keep the original HTML code in the final render
         *      - The "base" HTML must be emptied of the components templates
         *        because otherwise Vue will think that the content of those
         *        component tags is the default slot and will still parse them
         *        which will of course result in errors
         *    To that effect, each defined component is actually "duplicated"
         *    every time it is found in the DOM so that it can have several
         *    templates. Once a component template has been extracted, the
         *    node containing it is emptied and replaced by a node containing
         *    the component unique name (basically the "base" name + a counter)
         *    as tag name so that later Vue can pick it up. As components can
         *    include components but also this parsing is destructive, we need
         *    to parse kids first and "eat up" the DOM from the bottom. That's
         *    done by reading the DOM in reverse.
         * 3. All parsed templates are added to a list that will be returned.
         *    The parsed templates are basically equivalent to the outerHTML.
         *    This guarantees that the template has one root node and that the
         *    output will be equivalent to the original HTML code.
         * 4. The "base" template is generated. It's the original outerHTML code
         *    with all components replaced by a unique custom tag that Vue will
         *    pick up and replace with the dynamic components that we're
         *    generating here.
         *
         * @return {{components: [], base: string}}
         */
        templates() {
            const dom = htmlToDom(this.content);
            const contentExtract = this.extractContent(dom);
            const components = [];
            const counters = {};

            for (const [name, def] of Object.entries(this.componentsDefs)) {
                counters[name] = 1;

                for (const el of contentExtract.querySelectorAll(
                    def.selector
                )) {
                    el.setAttribute("data-rt-component", name);
                }
            }

            const interesting = contentExtract.querySelectorAll(
                "[data-rt-component]"
            );

            for (let i = interesting.length - 1; i >= 0; i -= 1) {
                const el = interesting[i];

                const name = el.getAttribute("data-rt-component");
                const newName = `${name}${counters[name]}`;

                el.removeAttribute("data-rt-component");

                components.push({
                    template: `${el.outerHTML}`,
                    baseName: name,
                    name: newName,
                });

                counters[name] += 1;

                const newEl = dom.createElement(camelToSnake(newName));
                el.parentNode.replaceChild(newEl, el);
            }

            return {
                base: contentExtract.outerHTML,
                components,
            };
        },

        /**
         * Takes all the components definitions to create for each unique
         * component (see `templates()`) a component that is a mix of:
         *
         * - The definition provided as a prop
         * - The template extracted from the content HTML
         * - The object declaring all components to one another to make sure
         *   that components can be used recursively
         *
         * What is returned by this function is used as the `components`
         * property for the dynamic component that we're creating here.
         */
        templatedComponents() {
            const out = {};

            for (const { template, baseName, name } of this.templates
                .components) {
                const def = this.componentsDefs[baseName];

                out[name] = {
                    ...def,
                    name: camelToSnake(name),
                    template,
                };
            }

            for (const component of Object.values(out)) {
                component.components = {
                    ...(component.components || {}),
                    ...out,
                };
            }

            return out;
        },

        /**
         * Definition of the dynamic component. Inserting it into the page will
         * generate in its stead the exact same HTML tree as the content
         * extracted from the props.
         */
        dynamicComponent() {
            return {
                name: "dynamic-component",
                components: this.templatedComponents,
                template: this.templates.base,
            };
        },
    },

    /**
     * We use a render function to be able to provide our dynamic component
     * without having to register it. The dynamic component then becomes the
     * root node of this component and thus this component will be replaced
     * exactly by the HTML code of the content without any superfluous wrapping
     * div.
     */
    render(createElement) {
        return createElement(this.dynamicComponent);
    },
};
</script>
