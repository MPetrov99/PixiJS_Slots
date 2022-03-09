//Creating the app
const Application = PIXI.Application;

const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});

app.renderer.backgroundColor = 0xcfdee3;

app.renderer.resize(window.innerWidth, window.innerHeight);

app.renderer.view.style.position = 'absolute'; //removing the excess screen space

document.body.appendChild(app.view);

//Adding Background Music By Using Howler.js
const sound = new Howl({
    src: ['./assets/sounds/backgroundsound.mp3'],
    loop: true,
    volume: 0.2
});

sound.play();

//Adding and Positioning Backgruond Image
const backgroundImageSprite = PIXI.Sprite.from('./assets/images/SlotFrame.png');
backgroundImageSprite.position.set(450, 100);
backgroundImageSprite.scale.set(0.8, 0.8)

app.stage.addChild(backgroundImageSprite);


//Adding Spin button
const buttonTextureNormal = PIXI.Texture.from('./assets/images/SpinButton_Normal.png');
const buttonTextureHover = PIXI.Texture.from('./assets/images/SpinButton_Hover.png');
const buttonTextureClicked = PIXI.Texture.from('./assets/images/SpinButton_Active.png');

const button = new PIXI.Sprite(buttonTextureNormal)

button.position.set(950, 800);
button.interactive = true;
button.buttonMode = true;

//Handling different button events.
button.on('pointerover', onButtonOver)
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerupoutside', onButtonUp)
    .on('pointerout', onButtonOut);

app.stage.addChild(button);

//Hover Function
function onButtonOver() {
    this.isOver = true;
    if (this.isdown) {
        return;
    }
    this.texture = buttonTextureHover;
}

//After hover Function
function onButtonOut() {
    this.isOver = false;
    if (this.isdown) {
        return;
    }
    this.texture = buttonTextureNormal;
}

//Button Click Function
function onButtonDown() {
    this.isdown = true;
    this.texture = buttonTextureClicked;
    this.alpha = 1;
}

//Drop click our of button boundaries Function
function onButtonUp() {
    this.isdown = false;
    if (this.isOver) {
        this.texture = buttonTextureHover;
    } else {
        this.texture = buttonTextureNormal;
    }
}

//Loading the symbols
app.loader
    .add('./assets/images/Symbol_1.png', './assets/images/Symbol_1.png')
    .add('./assets/images/Symbol_2.png', './assets/images/Symbol_2.png')
    .add('./assets/images/Symbol_3.png', './assets/images/Symbol_3.png')
    .add('./assets/images/Symbol_4.png', './assets/images/Symbol_4.png')
    .add('./assets/images/Symbol_5.png', './assets/images/Symbol_5.png')
    .add('./assets/images/Symbol_6.png', './assets/images/Symbol_6.png')
    .add('./assets/images/Symbol_7.png', './assets/images/Symbol_7.png')
    .add('./assets/images/Symbol_8.png', './assets/images/Symbol_8.png')
    .load(body); // 1

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

//"Main" Function
function body() { //2
    //Create Textures of each Symbol
    const slotTextures = [
        PIXI.Texture.from('./assets/images/Symbol_1.png'),
        PIXI.Texture.from('./assets/images/Symbol_2.png'),
        PIXI.Texture.from('./assets/images/Symbol_3.png'),
        PIXI.Texture.from('./assets/images/Symbol_4.png'),
        PIXI.Texture.from('./assets/images/Symbol_5.png'),
        PIXI.Texture.from('./assets/images/Symbol_6.png'),
        PIXI.Texture.from('./assets/images/Symbol_7.png'),
        PIXI.Texture.from('./assets/images/Symbol_8.png'),
    ];

    //Building the reels
    const reels = [];
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 6; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        //Making Sprites out of the Textures 
        for (let j = 0; j < 3; j++) { //setting the collumn number
            const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);

            //Scaling the symbols to fit the area.
            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    reelContainer.position.set(530, 350);

    app.stage.addChild(reelContainer);

    //Attaching the Spin button
    button.addListener('pointerdown', () => {
        startPlay();
    });

    let running = false;

    //Function to start a single Spin
    function startPlay() {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    //Reels handler
    function reelsComplete() {
        running = false;
    }

    //Listen for animate update
    app.ticker.add((delta) => {
        //Update the slots.
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            //Updating the blur filter "y" amount based on reel speed
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            //Update symbol positions on reel
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    //Detecting if a texture is going over and swaping it with new one
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

//Tweening utility function
const tweening = [];

function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    tweening.push(tween);
    return tween;
}
//Listen for animate update
app.ticker.add((delta) => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

//Lerp funtion
function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

//Backout function from tweenjs
function backout(amount) {
    return (t) => (--t * t * ((amount + 1) * t + amount) + 1);
}