# `masonry-component`

`masonry-component` is a lightweight, zero-dependencies [Web Component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) which allows you to display a bunch of images of different sizes in a 'masonry' style grid. 

<p align="center"><a href='https://htmlpreview.github.io/?https://raw.githubusercontent.com/chrishow/masonry-component/main/index.html' target=_blank'>Simple demo here</a></p>



## Benefits

 - **Super simple**: just one javascript file
 - **Really small**: 6.5k unzipped, 1.5k stripped and zipped
 - **Super fast**: No recalculation on resize (unless you change the number of columns, when it will happen automatically)
 - **Configurable with CSS**: Uses CSS vars to configure, so is easy to use in responsive pages
 
 ## How to use
 Include the javascript:
 ```javascript
 <script src='path/to/masonry-component.js'></script>
 ```
Add the HTML:
```html
<masonry-component>
	<img src='https://picsum.photos/600/300' width=600 height=300>
	<img src='https://picsum.photos/600/500' width=600 height=500>
	<img src='https://picsum.photos/600/200' width=600 height=200>
	<img src='https://picsum.photos/600/300' width=600 height=300>
	...
</masonry-component>
```
.. and that's it. 

## Configuration
There are two options, the number of columns, and the gap between the items. These are both controlled using CSS custom properties, so can be specified in your CSS, HTML (or both). 
```css
masonry-component {
	--masonry-gap: 10px;
	--masonry-column-count: 3;
}
```
`masonry-gap` can be specified in pretty much any unit (`px`, `rem`, `em`, `vw`). Technically, it can be any unit that works as a `margin-bottom`, so percentage units are not supported.

This makes it super easy to change the number of columns at smaller widths, eg:
```css
masonry-component {
	--masonry-gap: 10px;
	--masonry-column-count: 3;
	
	@media (max-width: 800px) {
		--masonry-column-count: 3;
	}
}
```
Recalculation will happen automatically when the window width changes to match the media query.  

## Advanced usage
If you don't know the dimensions of your images so can't add `width` and `height` attributes to the image tags, you will want to trigger a re-layout as the images load. You can do this at any time by calling the `layout` method on the component:
```javascript
document.querySelector('masonry-component').layout();
```
To automatically trigger as each of the images load, you can do this:
```javascript
document.querySelectorAll('masonry-layout img').forEach(
	(img) => {img.onLoad = ()=> img.closest('masonry-layout').layout()}
);
```
## Licence
Licen[c|s]e is [MIT](https://opensource.org/license/mit/), you can do what pretty much you want with it. 

## Credits
`masonry-component` was written by [Chris How](https://github.com/chrishow/), based on [andreasbm/masonry-layout](https://github.com/andreasbm/masonry-layout)