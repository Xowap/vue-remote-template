export async function getWagtailPageFromRoute(route) {
    return new Promise((resolve) => {
        // language=HTML
        resolve(`<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Yo dis title for "${route.path}"</title>
    <meta name="description" content="I like potatoes very mucho" />
    <script>
      alert("you lost");
    </script>
  </head>

  <body>
    <h1>I AM OUTSIDE THE CONTENT</h1>

    <div class="page-content">
      <h1>This is page</h1>

      <BlockOne>
        <h2>This is block one</h2>

        <p>It is lovely content but no script</p>
      </BlockOne>

      <BlockTwo>
        <h2>This is block two</h2>

        <p>It is less lovely because it has script</p>

        <p>Number of clicks on that fucking button: {{ clicks }}</p>

        <p>
          The fucking button:
          <button @click.prevent="increment">CLICK MOFO</button>
        </p>
      </BlockTwo>

      <BlockTwo>
        <h2>This is another block two</h2>

        <p>It should be different from the first one</p>

        <p>Number of clicks on that fucking button: {{ clicks }}</p>

        <p>
          The fucking button:
          <button @click.prevent="increment">CLICK MOFO</button>
        </p>

        <BlockTwo>
          <h3>This is actually a block two inside a block two</h3>

          <p>And inside of it you clicked {{ clicks }}</p>

          <p>
            Yeah the
            <button @click.prevent="increment">button</button>
          </p>
        </BlockTwo>
      </BlockTwo>

      <BlockThree>
        <h2>This is block three</h2>

        <p>This is yet another block which shall make sure of things like...</p>

        <p>_uid = {{ _uid }}</p>
      </BlockThree>
    </div>
  </body>
</html>
`);
    });
}
