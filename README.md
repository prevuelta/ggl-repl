# General Graphics Language REPL

## WORK IN PROGRESS

Minimalist drawing language for people who like to think inside the box.
_Browser based General Graphics Language interpreter for SVG_

## To run:

```
yarn start
```

Dev process to build && watch:

```
yarn dev
```

Enjoy :)

## General Graphics Language (GGL)

### General

`d:` document
`s:` style [fill] [stroke] [strokeWeight] eg. red outline `s:none #ff0000 1u`

### Grids

`cg:` circle grid
`sq:` square grid

### Transformations

`tr:` translate
`sc:` scale
`r:` rotate

### Reflections

`rx:` reflect on x axis
`ry:` reflect on y axis


### Shapes

`sq:` Square
`ci:` Circle

#### Drawing paths

`p:` path (point)
`a:` arc
`+:,-:` vectors
`t:` tangent

### Inline loops

`n[]` eg. `2[{x}u 1u]` repeat path command twice

### Loops

`re:n` repeat

### Interpolation

`{x}` `{x/2}`