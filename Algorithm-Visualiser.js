class algorithmVisualiser{
  configVariables(){ // Bodge for ES6 not supporting Public Field Declarations
    self.dataSet = {
      data: [],
      comp: [],
      compCount: 0,
      swap: [],
      swapCount: 0,
      iteration: 0
    };
    self.options = {
      size: 128,
      delay: 16,
      structure: "Random",
      algorithm: "Bubble Sort",
      gui: false,
      fps: false,
      lineColor: "#0000FF",
      compColor: "#FF0000",
      swapColor: "#00FF00",
      lineWidth: 2.5
    }; 
  }
  constructor(canvas, opts = {}) {
    self = this;
    self.configVariables();
    self.configDynamicFunctions();
    self.options = {...self.options, ...opts}; // Apply construction options    
    self.ctx = canvas.getContext('2d');
    
    if(self.options.gui){
      var gui = new dat.GUI();
      gui.add(self.options, 'algorithm', self.algorithms.map(x => x.name)).name("Algorithm");
      gui.add(self.options, 'structure', self.structures.map(x => x.name)).name("Structure").onFinishChange(self.reset);
      gui.add(self.options, 'size', 64, 1024, 64).name("Size").onChange(self.reset);
      gui.add(self.options, 'delay', 0, 64).name("Delay (ms)");
      gui.add(self, 'reset').name("Reset");
      gui.add(self, 'startStop').name("Start / Stop");
      
      let advFolder = gui.addFolder("Advanced");
      advFolder.addColor(self.options, 'lineColor');
      advFolder.addColor(self.options, 'compColor');
      advFolder.addColor(self.options, 'swapColor');
      advFolder.add(self.options, 'lineWidth', 0, 15);
      
      if(self.options.fps != false && self.options.gui){
        self.options.fps = new Stats();
        self.options.fps.domElement.height = '48px';
        [].forEach.call(self.options.fps.domElement.children, (child) => (child.style.display = ''));
        
        var perfFolder = gui.addFolder("Performance");
        var perfLi = document.createElement("li");
        self.options.fps.domElement.style.position = "static";
        perfLi.appendChild(self.options.fps.domElement);
        perfLi.classList.add("gui-stats");
        perfFolder.__ul.appendChild(perfLi);
      }
      
    }
    
    if(self.options.fps != false && !(self.options.gui)){
      self.options.fps = new Stats();
      self.options.fps.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      self.options.fps.domElement.style = "position:fixed;top:0;left:0;";
      document.body.appendChild( self.options.fps.domElement );
    }
    
    self.reset();
    self.draw();
  }

  startStop(){
    self.algorithms.find(x => x.name === self.options.algorithm).algorithm();
  }
  
  reset(){
    self.structures.find(x => x.name === self.options.structure).func();
    self.dataSet.iteration = 0;
    self.dataSet.swapCount = 0;
    self.dataSet.compCount = 0;
  }

  draw(){
    if(self.options.fps != false){self.options.fps.begin();}
    var ctx = self.ctx;
    var width = ctx.canvas.width = ctx.canvas.clientWidth;
    var height = ctx.canvas.height = ctx.canvas.clientHeight;
    var scaleY = (height / Math.max(...self.dataSet.data));
    var lineWidth = self.options.lineWidth || (width/self.dataSet.data.length)+0.5;
    
        
    for(let i=0;i<self.dataSet.data.length;i++){ // For every element in the dataset, draw its line
      ctx.strokeStyle = self.options.lineColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      
      if(self.dataSet.comp.includes(i)){ // If the line is currently in a comparison, draw it in that colour
        ctx.lineWidth = lineWidth*3;
        ctx.strokeStyle = self.options.compColor;
      }
      
      if(self.dataSet.swap.includes(i)){ // If the line is currently in a swap, draw it in that colour
        ctx.lineWidth = lineWidth*3;
        ctx.strokeStyle = self.options.swapColor;
      }
      
      ctx.moveTo(i*(width/self.dataSet.data.length), height);
      ctx.lineTo(i*(width/self.dataSet.data.length), height - (self.dataSet.data[i] * scaleY));
      
      ctx.stroke();
    }
    
    ctx.font = "15px Arial";
    var textStr = `${self.options.algorithm} Iteration: ${self.dataSet.iteration} Comparisons: ${self.dataSet.compCount} Swaps: ${self.dataSet.swapCount}`;
    ctx.fillText(textStr, 10, 25);
    
    if(self.options.fps != false){self.options.fps.end();}
    window.requestAnimationFrame( () => self.draw() );
    //window.requestAnimationFrame( this.draw.bind(this) ); // Fix "this" binding
  }
  
  async wait(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
  }
  
  configDynamicFunctions(){ // Bodge for ES6 not supporting Public Field Declarations  
    self.structures = [
      {name:"Random", func: ()=>{
        self.dataSet.data = Array.from({length: self.options.size}, () => Math.floor(Math.random() * self.options.size));
      }},
      {name:"Random Unique", func: ()=>{
        self.dataSet.data = Array.from(new Array(self.options.size),(v,i)=>i);
        for (let i = self.dataSet.data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [self.dataSet.data[i], self.dataSet.data[j]] = [self.dataSet.data[j], self.dataSet.data[i]];
        }
      }},
      {name:"Reverse Order", func: ()=>{
        self.dataSet.data = Array.from(new Array(self.options.size),(v,i)=>self.options.size-i);
      }},
      {name:"Nearly Sorted", func: ()=>{
        // TODO: Make Nearly Sorted Arr
      }},
      {name:"Few Unique", func: ()=>{
        // TODO: Make Arr with a few unique values
      }}
    ]

    self.algorithms = [

      {name:"Bubble Sort",algorithm: async ()=>{
        for (let i = ( self.dataSet.data.length - 1); i >= 0; i--){
          for (let j = ( self.dataSet.data.length - i); j > 0; j--){
            self.dataSet.iteration++;
            self.dataSet.compCount++;
            self.dataSet.swap = [];
            self.dataSet.comp = [j-1, j];
            if (self.dataSet.data[j] < self.dataSet.data[j - 1]){
              [ self.dataSet.data[j-1], self.dataSet.data[j] ] = [ self.dataSet.data[j], self.dataSet.data[j-1] ];
              self.dataSet.swap = [j-1, j];
              self.dataSet.swapCount++;
            }
            await self.wait(self.options.delay); // Delay before next iteration
          }
        }
        self.dataSet.swap = []; // Finished Empty active data
        self.dataSet.comp = []; // Finished Empty active data
      }},

      {name:"Quick Sort",algorithm: async ()=>{

      }},

      {name:"Reverse Order",algorithm: async ()=>{

      }}

    ];
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*                                                   End Class                                                 */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var AV;

window.onload = () => {
  let AVCanvas = document.getElementById("algorithm-visualiser");
  AV = new algorithmVisualiser(AVCanvas, {gui: true, fps: true});
};