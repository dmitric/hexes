import React, { Component } from 'react'
import './App.css'
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

function linksFromPoints(points) {
  let pointString = ""

  for (let i=0; i < points.length; i++) {
    pointString += `${points[i][0]} ${points[i][1]} `
  }

  return pointString
}

function polygon(x, y, radius, sides) {
  const coordinates = []

  /* 1 SIDE CASE */
  if (sides === 1) {
    return [[x, y]]
  }

  /* > 1 SIDE CASEs */
  for (let i = 0; i < sides; i++) {
    coordinates.push([(x + (Math.sin(2 * Math.PI * i / sides) * radius)), (y - (Math.cos(2 * Math.PI * i / sides) * radius))])
  }

  return coordinates
}

class App extends Component {
	constructor (props) {
    super(props)

    this.state = {
      displayColorPickers: true,
      padding: 50,
      innerPadding: 10,
      leftColor: 'orange',
      middleColor: 'red',
      rightColor: 'blue',
      paper: 0,
      dimension: 3,
      points: 6
    }
  }

  generatePaper (opacity) {
    const rects = []
    
    if (opacity === 0) {
      return rects
    }

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    for (let w=0; w < actualWidth -1 ; w += 2) {
      for (let h=0; h < actualHeight -1; h += 2) {
        let g = this.between(75, 95)
        rects.push(<rect key={`${w}-${h}`} x={w} y={h} height={2} width={2}
          fill={tinycolor({r: 255 * g/100, g: 255 * g/100, b: 255 * g/100 }).toHexString() }
          fillOpacity={opacity} />)
      }
    }

    for (let i = 0; i < 30; i++) {
      let g2 = this.between(40, 60)
      rects.push(<rect key={`${i}-dot`} width={this.between(1,2)} height={this.between(1,2)}
        x={this.between(0, actualWidth-2)}
        y={this.between(0, actualHeight-2)}
        fill={ tinycolor({r: 255 * g2/100, g: 255 * g2/100, b: 255 * g2/100 }).toHexString()}
        fillOpacity={this.between(opacity*250, opacity*300)/100} />)
    }

    return rects
  }

  componentWillMount () {
    this.updateDimensions()
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)

    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.decrementDimension())
      .on("swipeup", ev => this.incrementDimension())
      .on("swipeleft", ev => this.decrementDimension())
      .on("swiperight", ev => this.incrementDimension())
      .on("pinchin", ev => { this.incrementDimension()})
      .on("pinchout", ev => { this.decrementDimension()})
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 80 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.togglePaper()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementDimension()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementDimension()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementPoints()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementPoints()
    }
  }

  togglePaper() {
    this.setState({paper: this.state.paper ? 0 : 0.1})
  }

  incrementDimension () {
    this.setState({dimension: Math.min(40, this.state.dimension + 1)})
  }

  decrementDimension () {
    this.setState({dimension: Math.max(1, this.state.dimension - 1)})
  }

  incrementPoints () {
    this.setState({points: Math.min(20, this.state.points + 2)})
  }

  decrementPoints () {
    this.setState({points: Math.max(2, this.state.points - 2)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `hexes.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    const dim = Math.min(width, height)
    const settings = { width: dim, height: dim }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
      settings.innerPadding = 15
    } else {
      settings.padding = 50
      settings.innerPadding = settings.padding
    }

    this.setState(settings)
  }

  generatesHexes () {
    const hexes = []
    const hexHeight = this.getActualHeight()/this.state.dimension
    const hexRadius = hexHeight/2

    for (let j = 0; j < this.state.dimension; j++) {
      
      const isOffset = j % 2 === 0
      
      const rows = Math.max(isOffset ? this.state.dimension - 1 : this.state.dimension, 1)
      
      for (let i = 0; i < rows ; i++) {
        const offset = isOffset && this.state.dimension !== 1 ? hexRadius : 0

        const centerX = hexRadius + j * hexHeight
        const centerY = hexRadius + i * hexHeight + offset

        const poly = polygon(centerX, centerY, hexRadius, this.state.points);
        
        const pointString = linksFromPoints(poly)

        const firstX = hexHeight * j + hexRadius
        const firstY = i * hexHeight + offset

        const secondX = hexHeight * j + hexRadius - hexHeight/4
        const secondY = i * hexHeight + hexHeight/2 + offset

        const thirdX = hexHeight * j + hexRadius + hexHeight/4
        const thirdY = i * hexHeight + hexHeight/2 + offset

        const fourthX = hexHeight * j + hexRadius
        const fourthY = i * hexHeight + hexHeight + offset

        hexes.push(
          <g key={`${i}-${j}`} transform={`rotate(30 ${centerX} ${centerY})`} >
            <polygon points={pointString} fill={`url(#grad-${j % 2})`} />
            <polygon
                points={`${firstX} ${firstY} ${secondX} ${secondY} ${fourthX} ${fourthY} ${thirdX} ${thirdY}`}
                fill={`url(#grad-${isOffset ? 1: 0})`} />
          </g>
        )
      }
    }


    return hexes
  }

  render () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    const hexes = this.generatesHexes()

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.leftColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({leftColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.middleColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({middleColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.rightColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({rightColor: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
             <defs>
                <linearGradient id="grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: this.state.leftColor, stopOpacity:1 }} />
                  <stop offset="50%" style={{ stopColor: this.state.middleColor, stopOpacity:1 }}  />
                  <stop offset="100%" style={{ stopColor: this.state.rightColor, stopOpacity:1 }} />
                </linearGradient>
                <linearGradient id="grad-1" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: this.state.leftColor, stopOpacity:1 }} />
                  <stop offset="50%" style={{ stopColor: this.state.middleColor, stopOpacity:1 }}  />
                  <stop offset="100%" style={{ stopColor: this.state.rightColor, stopOpacity:1 }} />
                </linearGradient>
              </defs>
            <rect width='100%' height='100%' fill={"url(#grad-0)"} />
            {hexes}
            <g>
              {this.generatePaper(this.state.paper)}
            </g>
          </svg>
        </div>

      </div>
    )
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App
