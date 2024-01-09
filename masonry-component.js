"use strict";

const COL_COUNT_CSS_VAR_NAME = '--masonry-column-count';
const DEFAULT_COL_COUNT = 3;

const GAP_CSS_VAR_NAME = '--masonry-gap';
const DEFAULT_GAP_PX = 10;

// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const ELEMENT_NODE_TYPE = 1;


const $template = document.createElement("template");
$template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: stretch;
    }

    #sizer {
      background-color: hotpink;
      width: var(${GAP_CSS_VAR_NAME}, ${DEFAULT_GAP_PX}px);
      height: var(${GAP_CSS_VAR_NAME}, ${DEFAULT_GAP_PX}px);
      position: absolute;
      z-index: -1;
      opacity: 0; 
    }

    .column {
	  max-width: calc((100% / var(${COL_COUNT_CSS_VAR_NAME}, 1) - ((var(${GAP_CSS_VAR_NAME}, ${DEFAULT_GAP_PX}px) * (var(${COL_COUNT_CSS_VAR_NAME}, 1) - 1) / var(${COL_COUNT_CSS_VAR_NAME}, 1)))));
	  width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .column:not(:last-child) {
      margin-right: var(${GAP_CSS_VAR_NAME}, ${DEFAULT_GAP_PX}px);
    }

    .column ::slotted(*) {
      margin-bottom: var(${GAP_CSS_VAR_NAME}, ${DEFAULT_GAP_PX}px);
      box-sizing: border-box;
      width: 100%;
      height: auto;
    }

    /* Hide the items that has not yet found the correct slot */
    #unset-items {
      opacity: 0.2;
      position: absolute;
      pointer-events: none;
    }
  </style>
  <div id="unset-items">
    <slot></slot>
  </div>
`;

class MasonryComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild($template.content.cloneNode(true));

    this.onResize = this.onResize.bind(this);
    this.layout = this.layout.bind(this);
  }

  connectedCallback() {
    window.addEventListener("resize", this.onResize);

    // 'sizer' element is used to measure gap so it can be specified 
    // in rem, em, vw, px
    this.$sizer = document.createElement('div');
    this.$sizer.setAttribute('id','sizer');
    this.shadowRoot.appendChild(this.$sizer);

    this.renderedColumnCount = 0;

    // Store computed style record for host
    this.masonryComputedStyle = getComputedStyle(this);

    // Schedule layout asap
    requestAnimationFrame(this.layout, 0);
  }

  disconnectedCallback() {
    // console.log("Custom element removed from page.");
    window.removeEventListener("resize", this.onResize);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log(`Attribute ${name} has changed.`);
  }

  onResize() {
    // If the number of columns haven't changed, no need to relayout
    if(this.renderedColumnCount !== this.columnCount) {
      this.layout();
    }
  }


  layout() {
    const colCount = this.columnCount;
    // console.log(`Laying out ${colCount} columns`);

    this.renderedColumnCount = colCount;

    // Compute relevant values we are going to use for layouting the elements.
    // const gap = this.gap;
    const gap = this.gap;

    const $elements = Array.from(this.children).filter(node => node.nodeType === ELEMENT_NODE_TYPE);
    // console.log($elements);

    // An array that keeps track of the highest col height.
    const colHeights = Array(colCount).fill(0);

    // Instead of interleaving reads and writes we create an array for all writes so we can batch them at once.
    const writes = [];

    // Go through all elements and figure out what column (aka slot) they should be put in.
    // We only do reads in this for loop and postpone the writes
    for (const $elem of $elements) {

      // Read the height of the element
      const height = $elem.getBoundingClientRect().height;

      // Find the currently smallest column
      let smallestColIndex = this.findSmallestColIndex(colHeights);

      // Add the height of the item and the gap to the column heights.
      // It is very important we add the gap since the more elements we have,
      // the bigger the role the margins play when computing the actual height of the columns.
      colHeights[smallestColIndex] += height + gap;

      // Set the slot on the element to get the element to the correct column.
      // Only do it if the slot has actually changed.
      const newSlot = smallestColIndex.toString();
      if ($elem.slot !== newSlot) {
        writes.push(() => ($elem.slot = newSlot));
      }
    }

    // Batch all the writes at once
    for (const write of writes) {
      write();
    }

    // Render the columns
    this.renderCols(colCount);
  }

  /**
* Render X amount of columns.
* @param colCount
*/
  renderCols(colCount) {
    // Get the current columns
    const $columns = this.columns;

    // // If the amount of columns is correct we don't have to add new columns.
    // if ($columns.length === colCount) {
    //   return;
    // }

    // Remove all of the current columns
    for (const $column of $columns) {
      $column.parentNode && $column.parentNode.removeChild($column);
    }

    // Add some new columns
    for (let i = 0; i < colCount; i++) {

      // Create a column element
      const $column = document.createElement(`div`);
      $column.classList.add(`column`);
      $column.setAttribute(`part`, `column column-${i}`);

      // Add a slot with the name set to the index of the column
      const $slot = document.createElement(`slot`);
      $slot.setAttribute(`name`, i.toString());

      // Append the slot to the column an the column to the shadow root.
      $column.appendChild($slot);
      this.shadowRoot.appendChild($column);
    }
  }

  /**
   * The column elements.
   */
  get columns() {
    return Array.from(this.shadowRoot.querySelectorAll(`.column`));
  }

  get columnCount() {
    let currentColCount = this.masonryComputedStyle.getPropertyValue(COL_COUNT_CSS_VAR_NAME);
    if(!currentColCount) {
      currentColCount = DEFAULT_COL_COUNT;
    }

    return parseInt(currentColCount, 10);
  }

  /**
   * The gap 
   */
  get gap() {
    // Meaasure sizer element to get pixel size
    const calculatedGap = this.$sizer.clientWidth;
		return calculatedGap;
	}

  findSmallestColIndex(colHeights) {
    let smallestIndex = 0;
    let smallestHeight = Infinity;
    colHeights.forEach((height, i) => {
      if (height < smallestHeight) {
        smallestHeight = height;
        smallestIndex = i;
      }
    });

    // console.log(colHeights);

    return smallestIndex;
  }
}

customElements.define("masonry-component", MasonryComponent);
