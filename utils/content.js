/**
 * This is a demo function that contains the hard-coded HTML of a page that you
 * should instead fetch over HTTP using Axios by example. The return is
 * asynchronous to prove the concept that this content can be fetched
 * asynchronously from a regular Nuxt page.
 */
export async function getOriginalPageFromRoute({ route }) {
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

      <section class="x-block-one">
        <h2>This is block one</h2>

        <p>It is lovely content but no script</p>
      </section>

      <section class="x-block-two">
        <h2>This is block two</h2>

        <p>It is less lovely because it has script</p>

        <p>
          Number of clicks on that fucking button: <strong>{{ clicks }}</strong>
        </p>

        <p>
          The fucking button:
          <button @click.prevent="increment">CLICK MOFO</button>
        </p>
      </section>

      <section class="x-block-two">
        <h2>This is another block two</h2>

        <p>It should be different from the first one</p>

        <p>
          Number of clicks on that fucking button: <strong>{{ clicks }}</strong>
        </p>

        <p>
          The fucking button:
          <button @click.prevent="increment">CLICK MOFO</button>
        </p>

        <div class="x-block-two">
          <h3>This is actually a block two inside a block two</h3>

          <p>And inside of it you clicked <strong>{{ clicks }}</strong></p>

          <p>
            Yeah the
            <button @click.prevent="increment">button</button>
          </p>
        </div>
      </section>

      <section class="x-block-three">
        <h2>This is block three</h2>

        <p>This is yet another block which shall make sure of things like...</p>

        <p>_uid = {{ _uid }}</p>
      </section>
    </div>
  </body>
</html>
`);
    });
}
