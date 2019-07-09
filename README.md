# Rüne

## WORK IN PROGRESS

Minimalist drawing program for people who like to think inside the box.
_Drawing language interpreter from RuneScript to SVG_

## To run:

```
npm start
```

Dev process to build && watch:

```
npm run watch
```

Enjoy :)

## RuneScript

## Language features TODO

* Path Basics
  * Point [DONE]
  * Vector [DONE]
  * Grid unit tokens [DONE]
  * Width / Height tokens [DONE]
  * Arc [IN PROGRESS]
  * Tangent
  * Inverted origin variations ie. p-x, p-y, p-xy
* Shapes
  * Ellipse
  * Rectangle
  * Rounded corners
* Styling
  * Fill
  * Stroke
* Nesting eg: p 100 100 [p 100 100]
* Loops eg p (x in [1,2,3]: (y in [1,2,3]: x y ))
* Loops with functions eg p (x in [0, 2PI] do cos(x) \* 2: (y in [1,...40]: x y))
* Symbols
  eg #[id]
  p v 10 01
  /#
* Translation eg. T100 100 [p 100 100]
* Rotation R2PI [p 100 100]

## Rendering features

* Path
  * Points
  * Vectors
  * Arcs
  * Tangents
* Helpers
  * Arcs
  * Tangents
