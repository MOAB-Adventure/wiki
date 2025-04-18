# Using the Generated Info Component, `<info-box>`
```html
<info-box>
  | [[name]] : Tiny Shooter
  | [[slots]] : AP1-1-1
  | [[image]] : default-icon.ico
  |   Basic Info
  | Fire Rate : 3/s # 1 per 20 frames
  | Damage : 1
  |   Upgrade Tree
  | [[navigator]] : Tiny Shooter@tiny-shooter~images/iti.png + Double Shooter@double-shooter
</info-box>
```
The `<info-box>` element automatically generates an informative box, based on text content, which has specific syntax.  
## Basics
The syntax is made up of multiple entries inside the element, between the tags. Each entry is separated by `|`, the vertical pipe symbol.
### Property-Value Pairs
The most basic part of the information, a property-value pair creates a table-like row with 2 parts: a property name and its value. It can optionally have extra information, which is shown as a (...) after the value, and reveals its content when hovered over.  
```
| <name> : <value> # <extra-info>
```
The ` : ` separates the property and the value/extra info. The ` # ` separates the value and the extra info. The spaces around the `:` and `#` are mandatory.
### Group Headers
These show up as bold text, without the lighter background. They are added by simply typing some text as a component:
```
| <text>
```
This text can even include the `:` with spaces around, like in property-value pairs, but cannot have any text after.
## Advanced Components
These are like property-value pairs, but they use a specific string, surrounded by 2 sets of square brackets, `[[ ]]` as the property name.
### Images
Images show up like headers, but with an image instead, rendered at half the width of the whole box.
```
| [[image]] : <url>
```
`<url>` is any relative or absolute (with (scheme)://) URL.
Using `[[i]]` instead will give a smaller image, taking up 20% width instead.
### Slot Information
Specific to weapons, these show information about the slot, option and tier of the weapon with special notation, and have a tooltip with normal English text.
```
| [[slot]] : <weapon-slot>-<option>-<tier>
```
The 3 properties are separated with a hyphen `-`, which does noe require spaces around it.
### Navigators
These are horizontally aligned lists of links, with a title and related image. Their syntax is more complicated:
```
| [[navigator]] : <display-text>@<destination-url>~<image-url>
```
The display text and image are optional, but the image requires both others to be present. If the display text is missing, the destination URL will be used instead.  
There are no spaces between the separators.  
## Special Properties
These cannot be added, only changed. They are surrounded by double curly braces, `{{ }}`.
### Name
Shown in the bar at the top of the info box, this is the first thing people will identify the content by:  
```
| {{name}} : <name>
```