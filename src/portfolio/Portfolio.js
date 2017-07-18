import { Component } from 'react'
import { div, img, a, p } from 'react-hyperscript-helpers'
import { hyper, hyperNoParams, detectIE } from '../helpers/decorators'
import { Motion, spring, presets } from 'react-motion'
import map from 'ramda/src/map'
import pipe from 'ramda/src/pipe'
import prop from 'ramda/src/prop'
import portfolioData from './Portfolio.json'
import autobind from 'autobind-decorator'
import './Portfolio.scss'

const hMotion = hyper(Motion)

@hyper
class PortfolioItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hover: false,
      currentImage: 0,
      transitioning: false,
    }
  }

  @autobind
  rotateImages() {
    //Rotate images while hover active
    if (this.state.hover) {
      //Start transition animation 200ms before image changes
      this.transtimeout = setTimeout(() => {
        this.setState(
          Object.assign(this.state, {
            transitioning: true,
          })
        )
      }, 1800)

      this.timeout = setTimeout(() => {
        //Transition to next image
        const nextImage =
          this.state.currentImage + 1 >= this.props.images.length
            ? 0
            : this.state.currentImage + 1
        this.setState(
          Object.assign(this.state, {
            currentImage: nextImage,
          })
        )

        //If still hovering, call rotate images again
        this.rotateImages()

        //End transition animation 200ms after image changes
        setTimeout(() => {
          this.setState(
            Object.assign(this.state, {
              transitioning: false,
            })
          )
        }, 200)
      }, 2000)
    } else {
      return false
    }
  }

  @autobind
  startTransition() {
    this.setState(
      Object.assign(this.state, {
        hover: true,
      })
    )
    //Only rotate images if image collection has more than one image
    if (this.props.images.length > 1) {
      this.rotateImages()
    }
  }
  @autobind
  endTransition() {
    //Clear timeouts when hover completes
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.transtimeout) {
      clearTimeout(this.transtimeout)
    }
    this.setState(
      Object.assign(this.state, {
        hover: false,
        currentImage: 0,
      })
    )
  }

  render() {
    const isIE = detectIE()
    let scale, opacity, tooltipClass

    //Check for ie - don't scale on IE because col flow doesn't display correctly, images are cut off
    if (isIE) {
      scale = 1
      opacity = this.state.transitioning ? 0.4 : this.state.hover ? 1 : 0.7
      tooltipClass = '.ieNoTooltip'
    } else {
      scale = this.state.hover ? 1.25 : 1
      opacity = this.state.transitioning ? 0.4 : this.state.hover ? 1 : 0.8
      tooltipClass = '.tooltip-bottom'
    }

    const image = this.props.images[this.state.currentImage]
    const zIndex = this.state.hover ? 50 : 1

    return hMotion(
      {
        key: this.props.name + 'motion',
        defaultStyle: {
          x: 0.5,
          y: 0.8,
        },
        style: {
          x: spring(opacity, presets.gentle),
          y: spring(scale, presets.gentle),
        },
      },
      [
        ({ x, y }) =>
          div(
            '.card.card-block.animateCard',
            {
              key: this.props.name + 'motionChild',
              style: {
                // Add translateZ to fix hover bug in Chrome
                transform: `scale(${y}) ${this.state.hover
                  ? 'translateZ(0)'
                  : ''}`,
                transformStyle: 'preserve-3d',
                zIndex: zIndex,
              },
              onMouseEnter: this.startTransition,
              onMouseLeave: this.endTransition,
            },
            [
              a(
                `.${pStyles.portfolioLink}`,
                {
                  href: this.props.link,
                  target: '_blank',
                },
                [
                  p(
                    tooltipClass,
                    {
                      'data-tooltip': this.props.name,
                    },
                    [
                      img('.card-img.img-fluid', {
                        src: image,
                        alt: this.props.name,
                        style: {
                          opacity: x,
                        },
                      }),
                    ]
                  ),
                ]
              ),
            ]
          ),
      ]
    )
  }
}

@hyperNoParams
class Portfolio extends Component {
  constructor(props) {
    super(props)
    if (document.images) {
      this.preloadImages()
    }
  }
  //Preload portfolio images, so the transition doesn't fail when trying to rotate images
  preloadImages() {
    const loadImage = imgSrc => {
      const newImage = new Image()
      newImage.src = imgSrc
    }

    //Create a new image for each image in image data
    map(pipe(prop('images'), map(loadImage)))(portfolioData.entries)
  }
  render() {
    const items = map(PortfolioItem)(portfolioData.entries)
    return div('.portfolio', [div('.card-columns.p-3', items)])
  }
}

export default Portfolio
