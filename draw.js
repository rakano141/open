const CANVAS_SCALE = 3;
const POWER_COEF = 0.01;
document.addEventListener("DOMContentLoaded", (loade)=>{
	const d = document;
	const canvas = d.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	//
	let main;
	//
	d.getElementById("load").addEventListener("click", (e)=>{
		if(d.getElementById("canvas_x").value) canvas.width = Number(d.getElementById("canvas_x").value) * CANVAS_SCALE;
		else canvas.width = d.documentElement.clientWidth * CANVAS_SCALE;
		if(d.getElementById("canvas_y").value) canvas.height = Number(d.getElementById("canvas_y").value) * CANVAS_SCALE;
		else canvas.height = d.documentElement.clientHeight * CANVAS_SCALE;
		//
		main = new Main(canvas);
		main.date = document.getElementById("date").value;
		console.log(document.getElementById("textcode").value);
		main.setDataList(document.getElementById("textcode").value);
		main.run();
	},false);
	d.getElementById("download").addEventListener("click", (e)=>{
		canvas.toBlob((blob) => {
	        const url = URL.createObjectURL(blob);
	        const a = document.createElement("a");
	        document.body.appendChild(a);
	        a.download = main.date.replace(/\//g, "_") + ".png";
	        a.href = url;
	        a.click();
	        a.remove();
	        setTimeout(() => {
	            URL.revokeObjectURL(url);
	        }, 1E4);
	    }, 'image/png');
	},false);
},false);
class Main{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.dataList = [];
		this.config = {}
		this.color = {
			list: [
				"rgba(255,50,50,0.7)",//red
				"rgba(10,255,10,0.7)",//green
				"rgba(30,144,255,0.7)",//dodgerblue
				"rgba(255,255,0,0.7)",//yellow
				"rgba(255,30,255,0.7)",//magenta
				"rgba(10,255,255,0.7)",//cyan
				"rgba(255,165,0,0.7)",//orange
			],
			rand: function(){return this.list[Math.floor(Math.random()*this.list.length)]}
		}
	}
	rand(min, max){return Math.floor(Math.random()*(max-min)+min);}
	setDataList(jsondata){
		if(jsondata == ""){console.log("Error: no text");return false;}
		let tmp_data = JSON.parse(jsondata);
		for(const elm of tmp_data){
			let name = elm.name, res = elm.res, id = elm.id;
			name = name.replace("(仮)", "");
			name = name.replace("オンラインゲーム", "オンゲ");
			switch(name){
				case "⚾️なんでも実況(ジュピター)": name = "おんＪ";break;
				case "なんでも実況(ウラヌス)": name = "なんＵ";break;
				case "たこ焼き・お好み焼き・その他": name = "おんたこ";break;
				case "ニュース速報＋": name = "ニュー速＋";break;
				case "ニュー速VIP": name = "ＶＩＰ";break;
				case "東アジアニュース速報＋": name = "東ア＋";break;
				case "アニメ・漫画ニュース速報": name = "アニ漫ニュー速";break;
				case "涙目ニュース速報": name = "ニュー速";break;
				case "芸能・音楽・スポーツ　ニュース速報＋": name = "芸スポ＋";break;
				case "ブラウザゲーム": name = "ブラゲ";break;
				case "携帯電話ゲーム": name = "携帯ゲー";break;
				case "スマートフォンアプリ": name = "スマホアプリ";break;
				case "大規模off(ネタオフ)": name = "大規模OFF";break;
				case "ネットゲーム": name = "ネトゲ";break;
				case "ソーシャルネットワーク": name = "ソーシャルネット";break;
				case "BS実況ch(無料民放)": name = "BS実況ch";break;
				case "電池・燃料電池・太陽電池": name = "電池";break;
				case "ＦＦ＆ドラクエだけの話題": name = "ＦＦ＆ＤＱ";break;
				case "アマチュア(同人)ゲーム": name = "同人ゲー";break;
				case "なりきりネタなんでもあり": name = "なりきりネタ";break;
			}
			this.dataList.push({name: name, res: res, id: id});
		}
		console.log(this.dataList);
		this.setConfig();
		this.setProperty();
	}
	setConfig(){
		this.config = {
			max: Math.floor(this.dataList[0].res/2 * this.dataList[0].id * POWER_COEF),
			minSize: 10 * CANVAS_SCALE,
			maxSize: Math.ceil((canvas.width>canvas.height)?canvas.height/6 : canvas.width/7) - 10 * CANVAS_SCALE,
			fontScale: 1.5,
			animation: true
		}
	}
	setProperty(){
		let objectData = [];
		const datalength = this.dataList.length;//(.length > 50) ? 50 : DATA.length;
		for(let i = 0; i < datalength; i++){
			let power = Math.ceil(this.dataList[i].res/2 * this.dataList[i].id * POWER_COEF);
			let size = this.config.maxSize * (Math.log(power) / Math.log(this.config.max)) + this.config.minSize;
			let a, b;
			for(let j = 0; j < 50; j++){
				a = this.rand(size, canvas.width-size);
				b = this.rand(size, canvas.height-size);
				let exit = true;
				for(let k = 0; k < objectData.length; k++){
					if(Math.sqrt(Math.pow(objectData[k].x-a,2) + Math.pow(objectData[k].y-b,2)) < objectData[k].size + size){
						exit = false;
						break;
					}
				}
				if(exit)break;
			}
			objectData[i] = {x:a,y:b,color:this.color.rand(),size:size,name:this.dataList[i].name,res:Number(this.dataList[i].res),power:power};
		}
		console.log(objectData);
		this.dataList = objectData;
	}
	run(){
		if(this.config.animation){
			this.setLoop();
		}else{
			this.draw();
		}
	}
	draw(scale = 100){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "#333333";
		this.ctx.font = this.canvas.width/10 + "px sans-serif";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillText(this.date, 0, 0);
		this.ctx.textBaseline = "middle";
		for(const elm of this.dataList){
			let namel = (elm.name.length < 5) ? 5 : elm.name.length;
			let size = elm.size * ((scale > 100)?1:scale/100);
			this.ctx.beginPath();
			this.ctx.arc(elm.x, elm.y, size, 0 , 2 * Math.PI, false);
			this.ctx.fillStyle = elm.color;
			this.ctx.fill();
			this.ctx.strokeStyle = "black";
			this.ctx.lineWidth = 2;
			this.ctx.stroke();
			this.ctx.fillStyle = "black";
			this.ctx.font = size/namel * this.config.fontScale + "px sans-serif";
			this.ctx.textAlign = "center";
			this.ctx.fillText(elm.name, elm.x, elm.y);
			this.ctx.font = size/namel * this.config.fontScale + "px sans-serif";
			this.ctx.fillText(elm.res, elm.x, elm.y+size/namel*this.config.fontScale);
			this.ctx.fillStyle = "red";
			this.ctx.font = size/namel/3 * this.config.fontScale + "px sans-serif";
			this.ctx.fillText("勢い："+elm.power, elm.x, elm.y-size/namel*this.config.fontScale/5*4);
		}
	}
	setLoop(){
		let handler = {};
		let p = 0, vp = 0, ap = 0.1;
		console.log(this.dataList);
		this.draw();
	    const loop = () => {
			this.draw(p);
			if(p < 100){
				p += vp, vp += ap;
				handler.id = requestAnimationFrame(loop);
			}
		}
	    handler.id = requestAnimationFrame(loop);
	}
}
const drawCircle = () => {

};
