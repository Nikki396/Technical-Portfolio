 // =========================
    // IMAGE DATABASE
    // =========================
    let ArtisticImages=[], BeautifulImages=[], CalmImages=[], HistoricalImages=[], MajesticImages=[];
    function preload(){
      ArtisticImages = [
        loadImage("image_database/ArtisticRomantic/AR1.png"), 
        loadImage("image_database/ArtisticRomantic/AR2.png"), 
        loadImage("image_database/ArtisticRomantic/AR3.png"),
        loadImage("image_database/ArtisticRomantic/AR4.png"),
        loadImage("image_database/ArtisticRomantic/AR5.png")];

      BeautifulImages = [
        loadImage("image_database/BeautifulCharming/BC1.png"), 
        loadImage("image_database/BeautifulCharming/BC2.png"), 
        loadImage("image_database/BeautifulCharming/BC3.png"),
        loadImage("image_database/BeautifulCharming/BC4.png")];

      CalmImages = [
        loadImage("image_database/CalmPeaceful/CP1.jpg"), 
        loadImage("image_database/CalmPeaceful/CP2.jpg"), 
        loadImage("image_database/CalmPeaceful/CP3.jpg"), 
        loadImage("image_database/CalmPeaceful/CP4.jpg"), 
        loadImage("image_database/CalmPeaceful/CP5.jpg"), 
        loadImage("image_database/CalmPeaceful/CP6.jpg"), 
        loadImage("image_database/CalmPeaceful/CP7.jpg")];

      HistoricalImages = [
        loadImage("image_database/HistoricalCultural/HC1.jpg"), 
        loadImage("image_database/HistoricalCultural/HC2.jpg"), 
        loadImage("image_database/HistoricalCultural/HC3.jpg"), 
        loadImage("image_database/HistoricalCultural/HC4.png"), 
        loadImage("image_database/HistoricalCultural/HC5.png")];

      MajesticImages = [
        loadImage("image_database/MajesticGrand/MG1.png"), 
        loadImage("image_database/MajesticGrand/MG2.png"), 
        loadImage("image_database/MajesticGrand/MG3.png"), 
        loadImage("image_database/MajesticGrand/MG4.png"),
        loadImage("image_database/MajesticGrand/MG5.jpg")];
    }

    // =========================
    // GLOBAL VARIABLES
    // =========================
    let current=null, currentImage=null, pixelSize=6;
    const color1='#1A6FB8', color2='#5BB5F0', color3='#A0D4F4';
    let isAnimating=false, imgLoaded=false;
    let masterVolume=0.5; // 全局音量变量

    const MODES = {
      Artistic: {label:"Artistic", set:()=>ArtisticImages, theme:"artistic and romantic"},
      Beautiful: {label:"Beautiful", set:()=>BeautifulImages, theme:"beautiful and charming"},
      Calm: {label:"Calm", set:()=>CalmImages, theme:"calm and peaceful"},
      Historical: {label:"Historical", set:()=>HistoricalImages, theme:"historical and cultural"},
      Majestic: {label:"Majestic", set:()=>MajesticImages, theme:"majestic and grand"}
    };

    const channel = new BroadcastChannel('thames-channel');

    // =========================
    // MUSIC VARIABLES
    // =========================
    let polySynth, bassSynth, intervalId=null, step=0;
    let musicParams={};

    function setupMusic(){
      polySynth = new p5.PolySynth();
      bassSynth = new p5.MonoSynth();
      polySynth.setADSR(0.01,0.2,0.4,0.8);
      bassSynth.setADSR(0.05,0.3,0.5,0.6);
    }

    function startMusic(theme){
      userStartAudio();
      musicParams = getMusicParams(theme);
      bassSynth.oscillator.setType("sine");
      if(intervalId) clearInterval(intervalId);
      step=0;
      intervalId = setInterval(playStep, musicParams.interval);
    }

    function playStep(){
      if(!musicParams.scale) return;
      const note = random(musicParams.scale);
      const duration = random([0.2,0.3,0.4]);
      // 使用 masterVolume 作为 velocity
      polySynth.play(note, masterVolume, 0, duration);
      if(step%4===0){
        bassSynth.play(musicParams.scale[0]/2, masterVolume, 0, 0.8);
      }
      step++;
      if(step>=240) clearInterval(intervalId);
    }

    function getMusicParams(theme){
      let waveTypes, interval, scale;
      theme = theme.trim().toLowerCase();
      function randElem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

      if(theme==="artistic and romantic"){ waveTypes=["sine","triangle","square"]; interval=300; scale=[261,294,330,349,392,440,494,523]; }
      else if(theme==="beautiful and charming"){ waveTypes=["triangle","sine","square"]; interval=400; scale=[261,330,392,523]; }
      else if(theme==="calm and peaceful"){ waveTypes=["sine","triangle"]; interval=500; scale=[220,247,294,330,370,440]; }
      else if(theme==="historical and cultural"){ waveTypes=["square","triangle","sine"]; interval=600; scale=[261,293,311,349,392,415,466,523]; }
      else if(theme==="majestic and grand"){ waveTypes=["sawtooth","square","sine"]; interval=250; scale=[261,277,311,370,415,466,523]; }
      return {waveTypes:[randElem(waveTypes), randElem(waveTypes)], interval, scale};
    }

    // =========================
    // BROADCAST CHANNEL HANDLER
    // =========================
    channel.onmessage = (e)=>{
      const data=e.data;
      const key=data.mode;

      // 模式切换 + 自动触发音乐
      if(MODES[key]){
        current=key;
        currentImage=random(MODES[key].set());
        imgLoaded=!!currentImage;
        document.getElementById('status').textContent=`mode: ${MODES[key].label}`;
        drawStatic();
        if(imgLoaded) isAnimating=true;
        startMusic(MODES[key].theme);
      }

      // 更新音量
      if(data.volume!==undefined) masterVolume=data.volume;

      // 播放/暂停
      if(data.playPause!==undefined){
        if(data.playPause){
          userStartAudio();
          if(!intervalId) intervalId=setInterval(playStep,musicParams.interval);
        }else{
          if(intervalId) clearInterval(intervalId);
          intervalId=null;
        }
      }
    };

    function mousePressed(){ userStartAudio(); }

    // =========================
    // P5 SETUP
    // =========================
    function setup(){
      createCanvas(windowWidth, windowHeight);
      colorMode(HSB,360,100,100);
      noStroke();
      background(0,0,15);
      setupMusic();
    }

    function windowResized(){
      resizeCanvas(windowWidth, windowHeight);
      if(imgLoaded && currentImage) currentImage.resize(width,0);
      drawStatic();
    }

    // =========================
    // MAIN DRAW LOOP
    // =========================
    function draw(){
      if(!imgLoaded||!isAnimating||!currentImage) return;
      for(let i=0;i<1200;i++){
        let sx=floor(random(currentImage.width));
        let sy=floor(random(currentImage.height));
        let c=currentImage.get(sx,sy);
        let cyan=cyanotype(c);
        let tx=map(sx,0,currentImage.width,0,width);
        let ty=map(sy,0,currentImage.height,0,height);
        let gradColor=gradientOverlay(ty/height);
        let finalColor=lerpColor(cyan,gradColor,0.55);
        let brightnessVal=0.3*red(c)+0.59*green(c)+0.11*blue(c);
        if(brightnessVal>160 && random()<0.25) finalColor=color(0,0,100);
        let offsetX=sin(TWO_PI*frameCount/120 + ty/30)*6 + random(-2,2);
        let offsetY=cos(TWO_PI*frameCount/120 + tx/30)*6 + random(-2,2);
        fill(finalColor);
        rect(tx+offsetX,ty+offsetY,pixelSize,pixelSize);
      }
    }

    // =========================
    // STATIC DRAW
    // =========================
    function drawStatic(){
      background(0,0,15);
      if(!imgLoaded||!currentImage) return;
      for(let sx=0;sx<currentImage.width;sx+=pixelSize){
        for(let sy=0;sy<currentImage.height;sy+=pixelSize){
          let c=currentImage.get(sx,sy);
          let cyan=cyanotype(c);
          let tx=map(sx,0,currentImage.width,0,width);
          let ty=map(sy,0,currentImage.height,0,height);
          let gradColor=gradientOverlay(ty/height);
          let finalColor=lerpColor(cyan,gradColor,0.55);
          let brightnessVal=0.3*red(c)+0.59*green(c)+0.11*blue(c);
          if(brightnessVal>160 && random()<0.25) finalColor=color(0,0,100);
          fill(finalColor);
          rect(tx,ty,pixelSize,pixelSize);
        }
      }
    }

    // =========================
    // CYANOTYPE MAPPING
    // =========================
    function cyanotype(c){
      let r=red(c),g=green(c),b=blue(c);
      let brightnessVal=0.3*r+0.59*g+0.11*b;
      let val=map(brightnessVal,0,255,0,1);
      val=pow(val,2.0);
      let h=210;
      let s=constrain(50+val*50+random(-5,5),0,100);
      let b2=constrain(10+val*90+random(-5,5),0,100);
      return color(h,s,b2);
    }

    // =========================
    // THREE-COLOR GRADIENT
    // =========================
    function gradientOverlay(t){
      let c1=color(color1),c2=color(color2),c3=color(color3);
      if(t<0.5) return lerpColor(c1,c2,t*2);
      return lerpColor(c2,c3,(t-0.5)*2);
    }
