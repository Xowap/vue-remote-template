# Vue Remote Template

This is an example of how to build components dynamically from templates that
are served by a CMS like Wagtail.

Suppose that your CMS generates some HTML code like this:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Foo</title>
</head>

<body>
<div class='page-content'>
    <section class='block-one'>
        Foo
    </section>
    
    <section class='block-two'>
        <button @click='increment()'>Clicked: {{ counter }}</button>
    </section>
</div>
</body>
</html>
```

Now you see, here you have some kind of Vue template in it that you want to
give life to however you need to execute this code on Nuxt side.

In order to do so:

1. Create a component like [`BlockTwo.vue`](components/blocks/BlockTwo.vue)
   - It's a normal component for most things, including the fact that you can
     use `style`
   - The only difference is that the `template` will be automatically provided
     from the source HTML
   - In order to do so, you need to define a `selector` attribute which
     indicates which elements you want to "overtake" in the original HTML
2. Create a page inspired by [`index.vue`](pages/index.vue)
   - Insert the `ServerTemplatedComponent` where you want your content to be
     inserted
   - Make sure to download the content (aka the original HTML code) in the 
     `asyncData()` method and to pass it to the `content` prop. See the
     [`getOriginalPageFromRoute()`](utils/content.js) function, you might want
     to replace its content with an Axios call.
   - Also make sure to have a `extract-content` prop that contains a function
     that will return the content section from the DOM. You can use the 2nd
     order function `extractSelector()` here as in the example.
   - You must also receive the `head` event in order to propagate the meta/link
     information to Nuxt (see the `head()` method, `headData` field and 
     `receiveHeadData()` method).
   - And finally, you must provide the `components-defs` object which has as
     key the name of the component and as value the component's definition
     (aka what you imported from the `.vue` file or just an object that you
     defined).
