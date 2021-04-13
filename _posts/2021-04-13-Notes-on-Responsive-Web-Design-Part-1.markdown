---
layout: post
title:  "Notes on Responsive Web Design: Part 1"
date:   2021-04-13
excerpt: "Here are some notes I had made while reading about responsive web design."
image: "/images/responsive-web-design.jpg"
---

# HTML elements

### Headings

Most of the HTML elements have an opening and a closing tag somewhat like this:

```html
<h1>
    Hello World!
</h1>
````

What we just typed was a level one heading. Similar to this, we can add level two, three, ..., six headings too which indicate different levels of subheadings.

### Paragraph

Preferred elements for paragraph text are **p** elements.

````html
<p>
    Yo, I'm a paragraph.
</p>
````

### Detour : Lorem Ipsum

It is a convention to use *lorem ipsum* text as placeholder text. This text is randomly scrapped from a famous passage by Cicero of Ancient Rome

### Comments

Commenting makes a code readable for other programmers, and yourself too! In HTML, comments are written as follows:

````html
<!-- This is a comment -->
````

### HTML5 elements

HTML 5 has introduced more descriptive HTML tags such as **main, header, footer, nav, video, article, section etc**. These tags give a descriptive structure to HTML, and makes it easier to read nd help with SEO (Search Engine Optimization).

#### Main tag

This helps search engines and other programmers find the main contents of the page.

````html
<main>
	<h1>Hello World!</h1>
    <h2>I am a cat :)</h2>
</main>
````

More onto HTML5 elements later!

### Images

The **img** element can be used to add images and we can point to the URL using the **src** attribute.  The **alt** attribute is used for screen readers to improve accessibility and is displayed if the image fails to load. (We can leave it empty if the image is purely decorative).

````html
<img src="LinkToImage" alt="Meow">
````

### Links

The anchor tag - **a** is used to link to content outside the web page. The **href** attribute define the destination address. (This tag can be nested in the **p** tag)

````html
<a href="https://google.com">Google is your best friend!</a>
````

We can also create internal links to jump to different sections within a webpage. The # symbol in the **href** attribute for the element. In the section to be referred, we need to add the **id** attribute to uniquely describe it. (Setting a blank # will lead to making dead links)

```html
<a href="#my-header">My header</a>
<h2 id="my-header">Hello World!</h2>
```

The **target** attribute when set to _blank will open the link in a new tab (or window).

We can also nest images in the **a** tag to make them links!

### Footers

The **footer** tag adds footers to the bottom of the page

````html
<footer>Copyrighted Meow</footer>
````

### Unordered list

The unordered lists start with **ul** tag and each element is referred to using **li** tag.

````html
<ul>
   <li>Hello</li>
   <li>World</li>
</ul>
````

### Ordered list

The ordered lists start with **ol** tag and each element is referred to using the **li** tag.

````html
<ol>
   <li>Hello</li>
   <li>World</li>
</ol>
````

### Text input

The **input** elements are a way to get input from the user and they are self-closing. We can add placeholder text which displays input before user has typed anything.

````html
<input type="text" placeholder="Type here">
````

### Forms

Web forms submit data to server and this can be done by specifying an **action** attribute in a **form** element. The submit button will submit the data to the URL. Adding the **required** attribute to the **input** element will make the input compulsory for submission.

````html
<form action="url_to_submit_data_to">
    <input type="text" required>
    <button type="submit">Submit</button>
</form>
````

### Radio buttons

These are a type of input in which a single answer can be chosen. We wrap the input element inside the label element for this. All related radio buttons should have the same **name** attribute to create a radio button group. By creating a radio group, selecting any single radio button will automatically deselect the other buttons within the same group ensuring only one answer is provided by the user. We need the **value** attribute to specify its value/

````html
<!-- We can either do this -->
<input id="cat" type="radio" name="cat-kitty" value="Cat" checked>
<label for="cat">Cat</label>

<!-- Or this -->
<label for="cat">
	<input id="cat" type="radio" name="cat-kitty" value="Cat">
</label>
````

### Checkboxes

This is similar to radio buttons, just for multiple selection of values! We need the **type** to be `checkbox` while the rest is same!

For both radio and checkboxes, the **checked** attribute will check it by default.

### Div

The **div** element is aa general purpose container for other elements.

````html
<div>
    ...
</div>
````

### id

We can set **id** of elements to style a single element or to select and modify specific elements with JavaScript, and these should be unique!

````html
<h1 id="top"></h1>
````



### Doctype

At the top of your document, you need to tell the browser which version of HTML your page is using.  

````html
<!DOCTYPE html> <!-- This specified HTML5 -->
<html>

</html>
````

### Head and Body

You can add another level of organization in your HTML document within the **html** tags with the **head** and **body** elements. Any markup with information about your page would go into the **head** tag. Then any markup with the content of the page (what displays for a user) would go into the **body** tag.

Metadata like **link, meta, title, style** go inside the **head** element.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta />
  </head>
  <body>
    <div>
    </div>
  </body>
</html>
```

# Basic CSS

### Color of Text

The **style** attribute is used to change the style and the color property sets the color.

````html
<h2 style="color: blue;">
    Cat
</h2>
````

### Style elements

There is a better way to style by not using inline CSS. At the top of the doc, we can create a style block something like this

````html
<style>
    h2{
        color: blue;
    }
</style>
````

This will apply to all h2 elements.

### CSS class

We can add a CSS class declaration as

````html
<style>
    .blue-text {
        color: blue;
    }
</style>
````

Now, we can apply this to an HTML element like

````html
<h2 class="blue-text">Cat</h2>
````

We can similarly apply this to many different elements.

### Font size

**font-size** controls the size of text

```css
h1{
	font-size: 30px;
}
```

### Font Family

**font-famiy** tells us the font type we are using

```css
h2{
    font-family: sans-serif;
}
```

We can also use fonts from the net using URLs. We add

````html
<link href="https://fonts.googleapis.com/css?family=Lobster" rel="stylesheet" type="text/css">
````

Now we can reference the font using Lobster in the CSS. Usually we specify both a FAMILY_NAME and a GENERIC_NAME (font as fallback if the first one doesn't load). The generic font families generally are monospace, serif and sans-serif.

### Image size

The **width** controls the element's width.  Similar to it is the **height** property.

````html
.medium-size{
    width: 200px;
}
````

### Borders

We can use border-style, border-color, border-width, border-radius -> to round corners

```css
.thick-green {
	border-color: green;
	border-width: 20px;
	border-style: solid;
    border-radius: 50%; /* 50% = circular.. Can also specify in px */
}
```

### Background color

The background-color property sets the elements background color.

````css
.blue-background{
    background-color: blue;
}
````

### Style using id

We can style **id** like classes and these have higher importance than a class, so if both are applied, this overrides the class. It should be applied to a single element only!

````css
#id-element{
    background-color: silver;
}
````

### Padding

All HTML elements are essentially rectangles. Three important properties control the space that surrounds each HTML element:

1. padding: Controls amount of space between the content and its border. We can specify it altogether using padding, or using padding-top,right,bottom,left. But this might get cumbersome, so we can specify 4 numbers in clockwise order i.e top,right,bottom,left something like this :

   ````css
   padding: 10px 20px 30px 40px
   ````

2. border:  We have already seen this

3. margin: Controls amount of space between element's border and surrounding elements. (This can be negative too). Similar to padding, we can specify all 4 individually! If it's value is auto, then we want to center. This method works for images, too. Images are inline elements by default, but can be changed to block elements when you set the display property to block.

### Style using attribute selectors

We can use [attr=value] attribute selector to style in this case.

````css
[type='radio']{
    margin: 10px 20px 30px 40px;
}
````

### Units

We have seen the px unit, but we can also use in and mm to specify inches and millimeters. These are absolute lengths, but we can specify relative too (em or rem)

The em property is based on the size of element's font.

````css
.my-padding{
    padding: 1.5em;
}
````

### Inheritance

The style can be inherited from the parent, such as any **h1** inside **body** will take the body's style unless anything specific is specified which will override the inheritance.

Now if we give 2 classes to **h1** and it has conflicts, then the second one in the definition (i.e defined later on in style) wins.

If we style using id, then it overrides classes too! And moreover, inline CSS will override all of them!!

One last way to override CSS (most important method) : use **!important** after the value in the style block.

### Color using Hex and RGB

We can use hex codes such as #ABCDEF to specify colors. Also, abbreviated hex can be used : for example red i.e #FF0000 can be specified as #F00.

Along with that rgb(20, 30, 40) type of color declaration can also be used.

### Variables

CSS variables can be created by typing two hyphens in front of it.

```css
--my-color: orange;
```

This can be referenced to as follows:

````css
background: var(--my-color, black)
````

We can attach fallback values too as shown above. To deal with browser compatibility issues, it is a good idea to  provide another more widely supported value immediately before your declaration.

### Inherit CSS Variables

CSS variables are inherited, so they are available in the selector and its descendants.

The **:root** element is a pseudo-class(more on that later) selector that matches the root element of the document (usually html). If we create variables there, they will be accessible everywhere. We can override these later on for specific usages in certain elements.

### Media Queries

Media queries are a feature of CSS that enable webpage content to adapt to different screen sizes and resolutions. They can be defined in style block as follows:

````css
@media (max-width: 350px) {
    :root {
        --var: value;
    }
}
````

# Applied Visual Design

### Text-Align

The **text-align** property of CSS allows for aligning the text.

1. justify: Causes all lines of text except the last line to meet the left and right edges of the line box.
2. center: Centers the text
3. right: Right-aligns the text
4. left: (default) left-aligns the text

````css
.text-field {
    text-align: center;
}
````

### Strong

**strong** tag makes the text bold and when used, the browser applies  the CSS:

````css
font-weight: bold;
````

The font-weight basically sets how thick or thin characters are.

### Underline

The **u** tag is used to underline and the browser applies the CSS:

````css
text-decoration: underline;
````

### Emphasize

The **em** tag is used to emphasize text and the browser applies the CSS:

````css
font-style: italic;
````

### Strikethrough

The **s** tag is used to strikethrough text, and the browser applies the CSS:

````css
text-decoration: line-through;
````

### Horizontal Line

The **hr** tag is used to add a horizontal line across the width of its containing element. (Note that it is self closing)

### Box Shadow

The **box-shadow** property applies one or more shadows to an element. It takes the property values for

1. offset-x: How far to push the shadow horizontally from the element

2. offset-y: How far to push the shadow vertically from the element

3. blur-radius [optional]

4. spread-radius [optional]

5. color

   We can create multiple box-shadows by separating them by commas

````css
box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
````

### Opacity

The **opacity** property adjusts the opacity of the item. If it's value is 1, then it is opaque, and at 0 it is completely transparent.

### Text Transform

The **text-transform** property changes the appearance of the text. Its values can be lowercase, uppercase, capitalize, initial, inherit (use text-transform of parent) and none <- default.

### Line Height

The **line-height** property is used to change the height of each line in a block of text.

### Pseudo Classes

A pseudo-class is a keyword that can be added to selectors, in order to select a specific state of the element. For example

````css
a:hover{
    color: red;
}
````

Thus the color of the anchor tag changes so red during its hover state.

### CSS Box Model

CSS treats each HTML element as its own box, which is usually referred to as the CSS Box Model. Block-level items automatically start on a new line (think headings, paragraphs, and divs) while inline items sit within surrounding content (like images or spans). The default layout of elements in this way is called the normal flow of a document, but CSS offers the position property to override it.

When the position of an element is **relative**, it allows you to specify how CSS moves it relative to its current position in normal flow of the page. It pairs with offsets like left or right and top or bottom.

````css
p{
    position: relative;
    bottom: 10px;
}
````

### Locking with Absolute

**absolute** locks the element in place relative to its parent container. Unlike the relative position, this removes the element from the normal flow of the document, so the surrounding items ignore it.

One nuance with absolute positioning is that it will be locked relative to its closest *positioned* ancestor. If you forget to add a position rule to the parent item, (this is typically done using `position: relative;`), the browser will keep looking up the chain and ultimately default to the body tag.

### Fixed position

The fixed position is a type of absolute positioning that locks an element and  removes the element from the normal flow of the document. One key difference between the fixed and absolute positions is that an element with a fixed position won't move when the user scrolls.

### Float

Floating elements are removed from the normal flow of a document and pushed to either the left or right of their containing parent element. It is usually used with the width property.

````css
float: right;
width: 50%;
````

### Z-Index

The **z-index** property can specify how elements are stacked on top of each other and it must be a whole number. (position: absolute | relative | fixed | sticky) makes the elements positions to overlap. Higher values for the z-index property of an element move it higher in the stack than those with lower values.

### Detour: Colors

#### Tertiary colors

Tertiary colors are the result of combining a primary color with one of its secondary color neighbors. For example, within the RGB color model, red (primary) and yellow (secondary) make orange (tertiary). There are various methods of selecting different colors that result in a harmonious combination in design. One example that can use tertiary colors is called the split-complementary color scheme. This scheme starts with a base color, then pairs it with the two colors that are adjacent to its complement. The three colors provide strong visual contrast in a design, but are more subtle than using two complementary colors.

|   Color   |   Hex   |
| :-------: | :-----: |
|  orange   | #FF7F0  |
|   cyan    | #00FFFF |
| raspberry | #FF007F |

#### Hue of a color

The **hsl()** property is an alternative way to pick color by stating hue, saturation and lightness.

**Hue** is what people generally think of as 'color'. If you picture a spectrum of colors starting with red on the left, moving through green in the middle, and blue on right, the hue is where a color fits along this line. In hsl(), hue uses a color wheel concept instead of the spectrum, where the angle of the color on the circle is given as a value between 0 and 360.

**Saturation** is the amount of gray in a color. A fully saturated color has no gray in it, and a minimally saturated color is almost completely gray. This is given as a percentage with 100% being fully saturated.

**Lightness** is the amount of white or black in a color. A percentage is given ranging from 0% (black) to 100% (white), where 50% is the normal color.

|  color  |         hsl         |
| :-----: | :-----------------: |
|   red   |  hsl(0, 100%, 50%)  |
| yellow  | hsl(60, 100%, 50%)  |
|  green  | hsl(120, 100%, 50%) |
|  cyan   | hsl(180, 100%, 50%) |
|  blue   | hsl(240, 100%, 50%) |
| magenta | hsl(300, 100%, 50%) |

#### Tone of a color

The hsl() option in CSS also makes it easy to adjust the tone of a color. Mixing white with a pure hue creates a tint of that color, and adding black will make a shade. Alternatively, a tone is produced by adding gray or by both tinting and shading. The saturation percent changes the amount of gray and the lightness percent determines how much white or black is in the color. This is useful when you have a base hue you like, but need different variations of it.

### Linear gradient

We can have color transitions in CSS like linear gradient

````css
background: linear-gradient(gradient_direction, color 1, color 2, ...)
````

The first specified the direction in degrees, and then the colors follow.  

The **repeating-linear-gradient()** is used to repeat the pattern.

````css
background: repeating-linear-gradient(
      90deg,
      yellow 0px,
      blue 40px,
      green 40px,
      red 80px
    );
````

### Pattern as background image

We can add **url()** to the background property to get an image of chosen texture or pattern.

### Transform

To change the scale of an element, the **transform** property has the **scale()** function.

````css
p {
    transform: scale(2);
}
````

We can add the transform property to the hover pseudo-class to increase the size using scale on hover!

The **skewX()/skewY()** function skews the selected element along its X/Y axis by a given degree. The **rotate()** rotates the element.

### Before and After pseudo-elements

The pseudo elements **::before** and **::after** are used to add something before or after a selected element. They require the **content** property to be defined and is used to add things like photo or text to the selected element. (For making shapes, leave the content property empty. )

### Keyframes and Animation properties

@keyframes rule controls what happens during the animation and the animation properties control how the animation behaves.

1. **animation-name**: Name of the animation used by @keyframes
2. **animation-duration**: Sets length of time for the animation

@keyframes is how to  specify exactly what happens within the animation over the duration. This is done by giving CSS properties for specific "frames" during the animation, with percentages ranging from 0% to 100%. The CSS properties for 100% is how the element appears at the end, right before the credits roll.

````css
#anim{
    animation-name: colorful;
    animation-duration: 3s;
}
@keyframes colorful{
    0%{
        background-color: blue;
    }
    100%{
        background-color: yellow;
    }
}
````

Same way, we can use it in the hover state to change color of a button!

3. **animation-fill-mode**: Specified the style applied to an element when animation has finished. Setting it to forwards will make the button highlighted after the animation has completed (note that initially it reverted back to the original state)

When the position of an element is specified, we can use the CSS offset properties like right, left, top and bottom to create movement (just specify them in the correct % block).

Adding opacity can make elements fade (or even disappear!)

4. **animation-iteration-count**:  Controls how many times we would like to loop through the animation. (For continuous running, set it to infinite else a number)
5. **animation-timing-function**: Controls how quickly the animated element changes over the duration of the animation. It's values could be ease [default] (slow start, fast in middle, slow end) or ease-out (fast start and slow end), ease-in (slow start and fast end) or linear (constant speed).

The **cubic-bezier** function provides even finer control over how the animation plays out. The shape of the curve represents how animation plays out and the curve lies on 1 by 1 coordinate system (X-axis: duration and Y-axis: change in animation). It has 4 main points : p0, p1, p2, p3 and p0 = (0,0) and p3 = (1,1) are set for us, so we need to vary only p1 and p2 and they are specified as (x1, y1, x2, y2). [Note y2 can be >1 also]

````css
animation-timing-function: cubic-bezier(0.25, 0.25, 0.5, 0.5);
````
