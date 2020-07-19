class Wheel {

	constructor(settings) {

		// these can be set by the user
		this._diameter = settings.diameter ? settings.diameter : 512;
		this._palette = settings.palette ? settings.palette : 'standard';
		this._colour = settings.colour ? settings.colour : 'white';
		this._shadow = settings.shadow ? settings.shadow : true;
		this._items = settings.items ? settings.items : false;

		this._x = settings.x ? settings.x : 0;
		this._y = settings.y ? settings.y : 0;

		this._steps = 200;

		this._palettes = {
			"standard": ["#60A917", "#00ABA9", "#D80073", "#A4C400", "#F0A30A", "#E51400", "#1BA1E2", "#AA00FF", "#F472D0", "#008A00", "#6A00FF", "#A20025", "#FA6800", "#0050EF"],
			"rainbow": ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"],
			"grey": ["#999999", "#BBBBBB", "#666666", "#CCCCCC", "#888888", "#555555", "#AAAAAA", "#777777"]
		};

		// these are defaults
		this._obj = undefined;

		// repeat the palettes a few times just in case.

		// all the spin vars
		this._spin = {
			step: 0,
			degree: 0,
			target: undefined,
			timer: undefined,
			wobble: 0
		};

		this._id = Math.round(Math.random() * 8999999) + 1000000;

	}


	// choose a random item to land on
	findTarget() {

		// clear any spin timers
		clearInterval(this._spin.timer);

		// set to no target each round
		this._spin.target = Math.round(Math.random() * (this._items.length - 1));

		console.log('winner: ' + this._items[this._spin.target]);

		// set the angle
		this._spin.target = 360 - ( this._spin.target * ( 360 / this._items.length ) );
		this._spin.degree = this._spin.target;

		// figure out how what degree to start on
		let j = 0;
		while ( j <= this._steps ) {
			this._spin.degree -= (Math.sin((((Math.PI/2)/this._steps)*j)-(Math.PI/2))+1) * 20;
			j++;
		}

		this._spin.step = 0;

		this._spin.timer = setInterval('wheel.spin();', 20);

		// if there's still no target, just idle.

	}


	// spins until we land on the winner
	spin() {

		// if we're in the initial spinning stage
		if ( this._spin.step < this._steps ) {

			this._spin.degree += (Math.sin((((Math.PI/2)/this._steps)*(this._steps-this._spin.step))-(Math.PI/2))+1) * 20;

			this._spin.step++;

		// now focus on the winner.
		} else {

			this._spin.degree = this._spin.target;

			clearInterval(this._spin.timer);

			// start on the upward movement.
			this._spin.wobble = 90;

			// start the idle timer
			this._spin.timer = setInterval('wheel.idle();', 20);

		}

		this._obj.style.transform = 'translateZ(0) rotate('+this._spin.degree+'deg)';
	}



	// what to do before we know of a winner
	idle() {
		this._spin.wobble += 2;
		if ( this._spin.wobble >= 360 ) {
			this._spin.wobble = 0;
		}

		this._obj.style.transform = 'translateZ(0) rotate(' + (this._spin.degree + ( ( Math.sin( ( (Math.PI*2) / 360 ) * this._spin.wobble ) * 1.5 ) - 1.5) ) + 'deg)';

	}



	init() {

		// fail if there's less than 4 items
		if ( this._items.length < 4 ) {
			return false;
		}

		// work out the size of the slices
		// each slice is 90 degrees
		// but we want to scale them to fit more than 4 slices in
		let sliceScale = (
			( 1 / this._diameter ) *
			(
				Math.tan(
					( 360 / (this._items.length * 2) ) * Math.PI / 180
				) *
				this._diameter
			)
		);
		let labelScale = 1 / sliceScale;



		// draw all the styles
		let tmp_style = document.createElement("style");
		tmp_style.innerHTML = `
			.wheel_container {
				position: absolute;
				left: ${this._x};
				top: ${this._y};
			}

			.wheel {
				overflow: hidden;
				border-radius: 50%;
				background-color: #96003c;
				transform: translateZ(0) rotate(0deg);
				font-family: sans-serif;
			}

			.wheel_slice {
				display: block;
				position: relative;
				border-style: solid;
				width: 0px;
				height: 0px;
			}

			.wheel_pin {
				display: block;
				position: absolute;
				border-style: solid;
				border-width: 32px;
				border-color: transparent white transparent transparent;
				width: 0px;
				height: 0px;
				transform: scaleY(0.5);
				top: ${(this._diameter/2)-32}px;
				left: ${this._diameter-48}px;
			}

			.wheel_pin_shadow {
				display: block;
				position: absolute;
				border-style: solid;
				border-width: 32px;
				border-color: transparent black transparent transparent;
				width: 0px;
				height: 0px;
				transform: scaleY(0.5);
				filter: blur(5px);
				top: ${(this._diameter/2)-32}px;
				left: ${this._diameter-48}px;
			}

			.wheel_cover {
				display: block;
				position: absolute;
				border-radius: 50%;
				background-color: white;
				box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.5);
				color: black;
				width: ${this._diameter * 0.15}px;
				height: ${this._diameter * 0.15}px;
				top: ${(this._diameter/2)-((this._diameter * 0.15)/2)}px;
				left: ${(this._diameter/2)-((this._diameter * 0.15)/2)}px;
			}
		`;
		document.body.appendChild(tmp_style);


		// create the container for the wheel
		let tmp = document.createElement("div");
		tmp.className = 'wheel_container';
		tmp.addEventListener('click', function() { wheel.findTarget(); });

			let tmp_wheel = document.createElement("div");
			tmp_wheel.id = this._id;
			tmp_wheel.className = "wheel";
			tmp_wheel.style = `
				-webkit-transform-origin: ${this._diameter / 2}px ${this._diameter / 2}px;
				width: ${this._diameter}px;
				height: ${this._diameter}px;
				${ this._shadow ? 'box-shadow: 0px 0px 12px rgba(0, 0, 0, 1);' : '' }
			`;

				// now go through and draw each slice
				for ( let i = 0, ilen = this._items.length; i < ilen; i++ ) {

					// this is done this way to replace a foreach, as we need to know which index we're up to
					let item = this._items[i];

					/*
						// figure out a pleasing colour
						// adapted from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
						$grc = M_PI / 3;
						$h = mt_rand(0, (M_PI / 3) * 85) / 100; // use random start value
						$h += fmod($i, 3) * $grc;
						$h = (1 / M_PI) * $h;

						$rgb = HSVtoRGB(array($h, 1, 1));
					*/
					tmp_wheel.innerHTML += `
						<div class="wheel_slice" style="
							border-width: ${this._diameter/2}px;
							border-color: transparent ${this._palettes[this._palette][i]} transparent transparent;
							top: -${i * this._diameter}px;
							transform-origin: ${this._diameter/2}px ${this._diameter/2}px;
							transform: rotate(${i * ( 360 / this._items.length )}deg) scaleY(${sliceScale});
						">
							<div style="
								position: relative;
								top: -12px;
								font-size: ${this._diameter / ( this._items.length * 2.5 )}px;
								left: ${this._diameter / 8}px;
								transform: scaleY(${labelScale});
								color: ${ this._colour === "white" ? '#FFFFFF' : '#000000' };



								${ this._shadow ? 'text-shadow: 0px 0px 12px rgba(0, 0, 0, 1);' : '' }
								${ this._font ? 'font-family: ' + this._font + ';' : '' }
							">
								${item.replace(" ", "&nbsp;")}
							</div>
						</div>
					`;


					/*
					<?php if ( ( isset($stroke) ) && ( $stroke == "yes" ) ) { ?>
									-webkit-text-stroke: <?php print(($diameter / (count($children))) / 50); ?>px <?php if ( $colour == "white" ) { ?>#000000<?php } else { ?>#FFFFFF<?php } ?>;
									-webkit-text-fill-color: <?php if ( $colour == "white" ) { ?>#FFFFFF<?php } else { ?>#000000<?php } ?>;
					<?php } ?>
					*/
				}

			// attach the wheel to the wheel container
			tmp.appendChild(tmp_wheel);

			// now draw the winner pin and cover as these don't need to spin
			let tmp_pin = document.createElement("div");
			tmp_pin.innerHTML = `
				${ this._shadow ? '<div class="wheel_pin_shadow"></div>' : '' }
				<div class="wheel_pin"></div>
				<div class="wheel_cover"></div>
			`;

			// attach the pin to the container
			tmp.appendChild(tmp_pin);

		// now attach it all to the document
		document.body.appendChild(tmp);

		// remember the nested wheel object so that we can spin it.
		this._obj = document.getElementById(this._id);

		// start the idle timer
		this._spin.timer = setInterval('wheel.idle();', 20);

	}
}
