---
layout: post
title:  "Notes on Responsive Web Design: Part 2"
date:   2021-04-14
excerpt: "Here are some notes I had made while reading about responsive web design."
image: "/images/responsive-web-design.jpg"
---
# Applied Accessibility

### Text alternative to images

The **alt** attribute on **img** tag describes image's content and provides text-alternative and helps in cases where image fails to load/can't be seen by user, and also is used by search engines. This is useful for people with visual impairments.

However, sometimes images are grouped with a caption already describing them, or are used for decoration only and here, we should leave the alt blank.

### Hierarchical relationship of content using Headings

The heading tags are workhorse tags to provide structure and labeling. Screen readers can be set to only read headings to provide summary. We should add semantic meaning to tags so that it indicates the content it has. Mostly, h2 should follow h1, and h3 should follow h2.

### Main element

HTML5 introduces tags such as main, header, footer, nav, article and section. By default, a browser renders these elements similar to the div. However, using them where appropriate gives additional meaning to your markup. The tag name alone can indicate the type of information it contains, which adds semantic meaning to that content. Assistive technologies can access this information to provide better page summary or navigation options to their users.

The main element is used to wrap the main content as is meant to surround information related to the page's central topic. It shouldn't have stuff like navigation links or banners. The main tag also has an embedded landmark feature that assistive technology can use to navigate to the main content quickly. "Jump to Main Content" link at the top of a page, using the main tag automatically gives assistive devices that functionality.

### Article element

It is a sectioning element used to wrap independent and self-contained content like blog entries. Note that the section element has slightly different meaning - it is used for grouping thematically related content while article element is used for stand-alone content. If there's no relationship between groups of content - use div.

### Header element

It's used to wrap introductory information or navigation links for its parent tag and works well around content repeated at top of multiple pages. (It's used in the body tag).

### Nav element

It's used for easy screen reader navigation and wraps the main navigation links in the page. (Note if there are repeated links at bottom of the page - use footer)

### Footer element

The footer element is used to contain copyright information or links to related docs usually at bottom of the page

### Audio element

It wraps sound or audio stream content in the markup and this too needs text alternative to be accessible to people who are hard of hearing (nearby text/transcript link).

The **audio** tag has the **controls** attribute and this shows the default controls - play, pause etc. and has keyboard functionality.

````html
<audio id="clip" controls>
	<source src="audio.mp3" type="audio/mpeg">
</audio>
````

### Figure element

It, along with **figcaption** is used to wrap visual representations with its caption and thus it gives two-fold accessibility by semantically grouping related content.

````html
<figure>
	<img src="img.jpg" alt="Photo of a cat">
    <br>
    <figcaption>
		Meow
    </figcaption>
</figure>
````

### Label element

The **label** tag wraps text for a specific form control item (usually name or label) and ties meaning to item to make form more readable. The **for** attribute on the tag associates label with the form control and is used by screen readers.

````html
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
</form>
````

### Fieldset element

Radio buttons come in a group usually and the **fieldset** tag surrounds the entire grouping of radio buttons to show the choices are part of a set. It uses the **legend** tag to describe the grouping (these two aren't necessary when choices are self-explanatory like gender).

````html
<form>
    <fieldset>
        <legend>Choose one of the two items:</legend>
        <input id="one" type="radio" name="items" value="one">
        <label for="one">One</label><br>
        <input id="two" type="radio" name="items" value="two">
        <label for="two">Twp</label><br>
    </fieldset>
</form>
````

### Date type in input

HTML5 added the date type in input, so depending on browser, a date picker shows up in the input field when its in focus. (For old browser, this defaults to text)

### Time element

The **time** element along with **datetime** attribute is to standardize times. The attribute is an inline element to wrap date/time on a  page. This holds a valid format of the date and helps to avoid confusion.

````html
<p>Let's meet on <time datetime="2022-04-14">14<sup>th</sup>April</time>time></time></p>
````

### Make elements visible to only a screen reader

 This is needed when information is in a visual format (like a chart), but screen reader users need an alternative presentation (like a table) to access the data. CSS is used to position the screen reader-only elements off the visual area of the browser window.

````css
.screen-reader{
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    top: auto;
    overflow: hidden;
}
````

Note that putting **display: none;** or **visibility: hidden;** hides the content from screen readers too, and putting width/height as 0px removes it from the normal flow of the document and screen recorders will ignore it.

### Contrast Text

Low contrast between colors can make text difficult to read so we need a certain amount to improve the readability, and WCAG recommends minimum of 4.5:1 contrast ratio for normal text : ratio calculated by comparing the relative luminance values of two colors (ranges from 1:1 for same color to 21:1 for black and white). We can vary the contrast by changing colors or l value in hsl().

### Attaching meaning to links

Screen reader users have various options for what type of content their device reads. These options include skipping to (or over) landmark elements, jumping to the main content, or getting a page summary from the headings. Another option is to only hear the links available on a page. Screen readers do this by reading the link text, or what's between the anchor tags and usually Click here/read more isn't good to put there.

### Access Keys

The **accesskey** attribute specifies a shortcut key to activate or bring focus to an element. It makes navigation efficient for keyboard users.

````html
<button accesskey="b">
    Important button
</button>
````

### Tab Index

The **tabindex **attribute has three functions relating to element's keyboard focus. It's value can be positive, negative or zero. Certain elements, such as links and form controls, automatically receive keyboard focus when a user tabs through a page. It's in the same order as the elements come in the HTML source markup. This same functionality can be given to other elements by placing it's value as zero.

````html
<div tabindex="0">
    I need focus
</div>
````

If its value is negative, it indicates that the element is focusable but not reachable by keyboard.

When tabindex is used, it enables the use of pseudo-class of **:focus**.

This attribute also specified the exact tab order of elements. This is achieved when the attribute's value is set to a positive number of 1 or higher. Setting a tabindex="1" will bring keyboard focus to that element first. Then it cycles through the sequence of specified tabindex values (2, 3, etc.), before moving to default and tabindex="0" items. This overrides the default order and might be confusing if user expects navigation from top.

# Principles of Responsive Web Design

### Media Query

Media Queries are a new technique introduced in CSS3 that change the presentation of content based on different viewport sizes. The viewport is a user's visible area of a web page, and is different depending on the device used to access the site.

Media Queries consist of a media type, and if that media type matches the type of device the document is displayed on, the styles are applied. You can have as many selectors and styles inside your media query as you want.

````css
@media (max-width: 100px){}
````

This returns the content when device's width is less than equal to 100px and the following media query returns the content when the device's height is more than or equal to 350px:

````css
@media (min-height: 100px){}
````

### Responsive Images

To make an image responsive with CSS, we add the following properties:

````css
img{
    max-width: 100%;
    height: auto;
}
````

This makes sure image is never wider than the container, and height as auto ensures aspect ratio.

### Retina Image for High Res Displays

Pixel density is an aspect that could be different on one device from others and this density is known as Pixel Per Inch(PPI) or Dots Per Inch(DPI). Due to the difference in pixel density between a "Retina" and "Non-Retina" displays, some images that have not been made with a High-Resolution Display in mind could look "pixelated" when rendered on a High-Resolution display. The simplest way to make your images properly appear on High-Resolution Displays, such as the MacBook Pros "retina display" is to define their width and height values as only half of what the original file is.

### Responsive Typography

Instead of em/px/sizetext, we can use viewport units for responsive typography (such as %). The four different viewport units are:

1. vw (viewport width): 10vw = 10% of viewport's width
2. vh (viewport height): 5vh = 5% of viewport's height
3. vmin (viewport minimum): 70vmin = 70% of viewport's smaller dimension
4. vmax (viewport maximum): 100vmax = 100% of the viewport's bigger dimension

# CSS Flexbox

### Display property

When this is set to flex, it allows you to use other flex properties to build a responsive page. Adding display: flex to an element turns it into a flex container. This makes it possible to align any children of that element into rows or columns. You do this by adding the **flex-direction** property to the parent item and setting it to row[default] or column. Creating a row will align the children horizontally, and creating a column will align the children vertically. The other values it can have are row-reverse and column-reverse.

### Justify content

Sometimes the flex items within a flex container don't fill the entire space. Setting a flex container as a row places the flex items side-by-side from left-to-right. A flex container set as a column places the flex items in a vertical stack from top-to-bottom. For each, the direction the flex items are arranged is called the **main axis**. For a row, this is a horizontal line that cuts through each item. And for a column, the main axis is a vertical line through the items. We space flex items along this main axis using the values of **justify-content** as follows:

1. **center**: Align all flex items to center inside the container
2. **flex-start**[default]: Aligns items to the start of the flex container. For a row, this pushes the items to the left of the container. For a column, this pushes the items to the top of the container.
3. **flex-end**: Aligns items to the end of the flex container. For a row, this pushes the items to the right of the container. For a column, this pushes the items to the bottom of the container.
4. **space-between**: Aligns items to the center of the main axis, with extra space placed between the items. The first and last items are pushed to the very edge of the flex container.
5. **space-around**: Similar to above but the first and last items are not locked to the edges of the container, the space is distributed around all the items with a half space on either end of the flex container.
6. **space-evenly**: Distributes space evenly between the flex items with a full space at either end of the flex container.

### Align Items

This is similar to the above property, just that above, we aligned along the main axis, while here align along the cross-axis (90 degrees to the main axis)

1. **flex-start**: Aligns items to the start of the flex container. For rows, this aligns items to the top of the container. For columns, this aligns items to the left of the container.
2. **flex-end**: Aligns items to the end of the flex container. For rows, this aligns items to the bottom of the container. For columns, this aligns items to the right of the container.
3. **center**: Align items to the center.
4. **stretch**[default]: Stretch the items to fill the flex container. For example, rows items are stretched to fill the flex container top-to-bottom.
5. **baseline**: Align items to their baselines. Baseline is a text concept, think of it as the line that the letters sit on.

### Flex Wrap

CSS flexbox has a feature to split a flex item into multiple rows (or columns). By default, a flex container will fit all flex items together. Using this property, we tell CSS to wrap items

1. **nowrap**[default]: Doesn't wrap items
2. **wrap**: Wraps items onto multiple lines from top-to-bottom if they are in rows and left-to-right if they are in columns.
3. **wrap-reverse**: Wraps items onto multiple lines from bottom-to-top if they are in rows and right-to-left if they are in columns.

### Flex Shrink

The above properties were applied to the flex-container, but we have properties applying to the the flex items too.

**flex-shrink** allows an item to shrink if the flex container is too small. Items shrink when the width of the parent container is smaller than the combined widths of all the flex items within it. It takes numbers as values and higher the number, more it will shrink.

### Flex Grow

This is the opposite of the above.

### Flex Basis

This specifies the initial size of the item before CSS makes adjustments with the above two properties. The units used by this are px, em, % etc (same as other size properties), and auto value sizes items based on the contents.

### Flex Shorthand

We can use the **flex** property to set **flex-grow**, **flex-shrink** and **flex-basis** properties together by specifying them separated by spaces.

### Order

This is used to tell CSS the order of how flex items appear in the flex container. By default, items will appear in the same order they come in the source HTML. The property takes numbers as values, and negative numbers can be used.

### Align-self

This is the final property for flex-items. This property allows you to adjust each item's alignment individually, instead of setting them all at once. This is useful since other common adjustment techniques using the CSS properties such as float, clear and vertical-align don't work on flex items. It accepts the same arguments as align-items.

# CSS Grid

We can turn any HTML element into a grid container by setting the display property to **grid**

### Add columns and rows

We need to define the structure of the grid too, after setting the display as grid. This can be done using the **grid-template-columns** property on a grid contaianer

````css
.container{
    display: grid;
    grid-template-columns: 30px 30px;
}
````

This gives the grid 2 columns each 30px wide.

Similar to the above property is **grid-template-rows.**

The values of these two can be absolute and relative like px, em. We can have % and auto too. Along with them, we can have fr -  sets the column or row to a fraction of the available space.

````css
grid-template-columns: auto 30px 20% 2fr 1fr
````

### Column and Row gap

The above property makes the columns and rows tight, and to add gap, we use **grid-column-gap** and **grid-row-gap** and specify a value which adds that much gap between all columns/rows.

We can combine the two into **grid-gap**. If this is given a single value, it will create that between all rows and columns, and if two values are given, the first is gap between rows and next is gap between columns.

### Grid Column and Row

Up till now, all properties are applied to the container, but now we see properties for the grid items. Lines are hypothetical and they create the grid (starting from 1). We can control the columns an item consumes using **grid-column** property in conjunction with the line numbers you want the item to start and stop at.

````css
grid-column: 1 / 3;
````

This makes the item start at first vertical line and span till 3rd and thus uses two columns.

Similar to above is **grid-row**.

### Horizontal and Vertical alignment

In CSS Grid, the content of each item is located in a box which is referred to as a cell. You can align the content's position within its cell horizontally using the **justify-self** property on a grid item.

1. **stretch**[default]: Content fills whole width of cell
2. **start**: left align
3. **end**: right align
4. **center**: center

Similar to above is **align-self** used for vertical alignment.

If we want all items to be aligned horizontally, we use the **justify-items** property and it accepts the same values as before. Similarly we have **align-items**.

### Area Template

We can group cells of our grid together into an area and give it a custom name. This is done using **grid-template-areas** on the container

````css
grid-template-areas:
	"header header header"
	"advert content content";
````

This merges the top top three cells together into an area names header, and makes two areas in the middle row. (We can use "." (period) to designate empty cell).

### Grid Area

After making the area template, we can place items by using the custom name we gave with the **grid-area** property.

````css
.item{
	grid-area: header;
}
````

We can also create areas on the fly for an item to placed

````css
grid-area: 1/1/2/4;
````

This denotes horizontal line to start at / vertical line to start at / horizontal line to end at / vertical line to end at.

### Repeat

We can use the **repeat()** function to to specify the number of times you want your column or row to be repeated, followed by a comma and the value you want to repeat.

````css
grid-template-rows: repeat(100, 50px)
````

This creates a 100 row grid, each 50px tall. You can also repeat multiple values with the repeat function and insert the function amongst other values when defining a grid structure.

````css
grid-template-columns: repeat(2, 1fr 50px) 20px;
````

### MinMax

This function is used to limit the size of items when the grid container changes size. To do this you need to specify the acceptable size range for your item.

````css
grid-template-columns: 100px minmax(50px, 200px);
````

Here, we create two columns : the first is 100px wide, and the second has the minimum width of 50px and the maximum width of 200px.

### AutoFill

The repeat function has an **auto-fill** option which allows you to automatically insert as many rows or columns of your desired size as possible depending on the size of the container. This adds flexibility, for example

````css
repeat(auto-fill, minmax(60px, 1fr));
````

When the container changes size, this setup keeps inserting 60px columns and stretching them until it can insert another one. **Note:** If your container can't fit all your items on one row, it will move them down to a new one.

### AutoFit

This works similar to above but the difference is that when the container's size exceeds the size of all the items combined, **auto-fill**  keeps inserting empty rows or columns and pushes your items to the side while **auto-fit** collapses those empty rows or columns and stretches your items to fit the size of the container. **Note:** If your container can't fit all your items on one row, it will move them down to a new one.

### Media Queries

We can make our site more responsive using media queries to rearrange grid areas, change dimensions of a grid, and rearrange the placement of items.

### Grids within Grids

Turning an element into a grid only affects the behavior of its direct descendants. So by turning a direct descendant into a grid, you have a grid within a grid. 
