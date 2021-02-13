<script>
/**
 * Converts a CamelCase tag name into a snake-case tag name, with the optional
 * addition of a prefix.
 *
 * By example:
 *
 * >> camelToSnake('ThisIsAButton', 'foo-')
 * <- "foo-this-is-a-button"
 *
 * Let's note that if you want to pass the prefix to the
 * ServerTemplatedComponent then you can use the 2nd-order-function
 * prefixedCamelToSnake right below.
 *
 * @param tagName {string}
 * @param classPrefix {string}
 * @return {string}
 */
export function camelToSnake(tagName, classPrefix = "") {
    return `${classPrefix}${tagName
        .split(/(?=[A-Z])/)
        .filter((x) => x)
        .join("-")
        .toLowerCase()}`;
}

/**
 * 2nd-order function to embed the prefix to camelToSnake.
 *
 * By example:
 *
 * >> xTag = prefixedCamelToSnake('x-')
 * >> xTag('ThisIsAPrefixedButton')
 * <- "x-this-is-a-prefixed-button"
 *
 * @param classPrefix {string}
 * @return {function(*=): string}
 */
export function prefixedCamelToSnake(classPrefix) {
    return (tagName) => camelToSnake(tagName, classPrefix);
}

/**
 * The makeComponentTag prop expects a function implementing this interface
 * which will generate the open/close tags for each dynamic component.
 *
 * In order to "generate" the right function for you (the tag you want with
 * the class you want) you can use the 2nd-order function makeElementWithClass()
 * instead.
 *
 * @param componentName
 * @param elementName
 * @param classMaker
 * @return {{close: string, open: string}}
 */
export function elementWithClass({
    componentName,
    elementName = "section",
    classMaker = camelToSnake,
}) {
    return {
        open: `<${elementName} class="${classMaker(componentName)}">`,
        close: `</${elementName}>`,
    };
}

/**
 * Generates a prop that makes tne enclosing tags of each component. See the
 * arguments of elementWithClass() to know what you can specify.
 *
 * @param args {object}
 * @return {function(*): {close: string, open: string}}
 */
export function makeElementWithClass(args) {
    return (componentName) => elementWithClass({ componentName, ...args });
}

export function extractSelector(selector) {
    return (dom) => dom.querySelector(selector);
}

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
        content: {
            type: String,
            required: true,
        },

        componentsDefs: {
            type: Object,
            required: true,
        },

        makeComponentTag: {
            type: Function,
            default: makeElementWithClass({
                classMaker: prefixedCamelToSnake("x-"),
            }),
        },

        extractContent: {
            type: Function,
            default: extractSelector("body"),
        },

        enclosingTags: {
            type: Object,
            default: () => ({
                open: '<div class="dynamic-component">',
                close: "</div>",
            }),
        },
    },

    computed: {
        templates() {
            const components = [];
            const dom = htmlToDom(this.content);
            const content = this.extractContent(dom);
            const toParse = [content];
            const interesting = [];
            const upperNames = {};
            const counters = {};
            let node;

            for (const [name] of Object.entries(this.componentsDefs)) {
                upperNames[name.toUpperCase()] = name;
                counters[name] = 1;
            }

            while ((node = toParse.shift())) {
                for (const child of node.childNodes) {
                    if (child.childNodes) {
                        toParse.push(child);
                    }
                }

                if (node.tagName) {
                    const upperName = node.tagName.toUpperCase();

                    if (upperNames[upperName]) {
                        interesting.unshift(node);
                    }
                }
            }

            for (const el of interesting) {
                const name = upperNames[el.tagName.toUpperCase()];
                const { open, close } = this.makeComponentTag(name);
                const newName = `${name}${counters[name]}`;

                components.push({
                    template: `${open}${el.innerHTML}${close}`,
                    baseName: name,
                    name: newName,
                });

                counters[name] += 1;

                const newEl = dom.createElement(camelToSnake(newName));
                el.parentNode.replaceChild(newEl, el);
            }

            return {
                base: content.innerHTML,
                components,
            };
        },

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

        dynamicComponent() {
            return {
                name: "dynamic-component",
                components: this.templatedComponents,
                template:
                    `${this.enclosingTags.open}` +
                    `${this.templates.base}` +
                    `${this.enclosingTags.close}`,
            };
        },
    },

    render(createElement) {
        return createElement(this.dynamicComponent);
    },
};
</script>
