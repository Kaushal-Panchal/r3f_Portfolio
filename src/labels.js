/* DOM nodes for the 3D ability labels, written to directly from the render
   loop so projecting them costs no React work. */
export const labelEls = []
export const setLabel = (i) => (el) => {
  labelEls[i] = el
}
