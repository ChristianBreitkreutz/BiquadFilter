// ==========================================================================================
// code.js
// 
// Christian Breitkreutz 
// christianBreitkreutz@gmx.de
//
//
// ==========================================================================================

// ------------------------------------------------------------------------------------------

// global variables 		
var offsetRight = 50;
var offsetLeft = 50;
var offsetBottom = 50;
var offsetField = 200; // px
var lenght= 950;
var height = 350 - offsetBottom;


// colors
var backgroundColor = "#180124";
var magnitudeColor = "#FFD340";
var phaseColor = "#367112";
var lineColor = "#999999";
var textColor = "#ffffff";//"#742C9B";
var errorColor = "#ff0000"
var preWarpText = "#999999";

var lineWidth = 5;

// biquad components
var samplingRate = 44100;
var b0 = 0.0; 
var b1 = 0.0;
var b2 = 0.0;
var a1 = 0.0;
var a2 = 0.0;

var isPreWarped = false;
var iscomputable = true;
var preWarpedCrossrate = 0;
var filterType = "lowpass";


// ------------------------------------------------------------------------------------------

function myInit(){
	// grafical settings

	if(window.innerHeight <= (height + offsetBottom + offsetField)){
		height = window.innerHeight - offsetBottom - offsetField -20;
	}

	
	document.getElementById("Area").height = height + offsetBottom;
	document.getElementById("Area").width = lenght + offsetLeft + offsetRight;
	
document.getElementById("myCenter").innerHTML = " <style type='text/css'> #myArea { position: absolute; width: "+ (lenght + offsetLeft + offsetRight) +"px; height: "+ (height + offsetBottom + offsetField) +"px; left: 50%; top: 50%; margin-left:"+ (lenght + offsetLeft + offsetRight)/-2 + "px; margin-top: "+ (height + offsetBottom + offsetField)/-2 +"px;}</style>";
	
	document.getElementsByTagName("body")[0].bgColor = backgroundColor;
	document.getElementById("aColor").innerHTML = "<style type='text/css'> a{color: "+ textColor +";}</style>";
	document.getElementById("CbPreWarping").style.backgroundColor="#ff0000";

	document.getElementById("cppValueName").style.color = textColor;
	document.getElementById("cppValueName").style.background = backgroundColor;
	document.getElementById("cppValueName").style.border = " 1px solid"+textColor;
	document.getElementById("cppValueName").style.size = 13;

	document.getElementById("cppDelay").style.color = textColor;
	document.getElementById("cppDelay").style.background = backgroundColor;
	document.getElementById("cppDelay").style.border = " 1px solid"+textColor;
	document.getElementById("cppDelay").style.size = 13;

	document.getElementById("cppCopyText").style.color = textColor;
	document.getElementById("cppCopyText").style.background = backgroundColor;
	document.getElementById("cppCopyText").style.border = " 1px solid"+textColor;
	document.getElementById("cppCopyText").style.size = 13;


	// init plot
	calcFilter(1000, 0.7);
	setNewParams();
    
}


// ------------------------------------------------------------------------------------------

function draw() {
	resetCanvas();
	var canvas = document.getElementById("Area");
	var context = canvas.getContext("2d");
	drawBackground(context);
	if(iscomputable){
		printPrewarping();
		plot();
	}
	iscomputable = true;
}


// ------------------------------------------------------------------------------------------

function resetCanvas() {
	var canvas=document.getElementById("Area");
	canvas.width = canvas.width;   			
	var context=canvas.getContext("2d");
	context.clearRect(0,0,canvas.width,canvas.height);
}


// ------------------------------------------------------------------------------------------

function drawBackground(context){
	// horizontal lines
	context.beginPath();
	// 10 db line
	context.moveTo(0.5 + offsetLeft,Math.round(height/4)-0.5);
	context.lineTo(lenght,Math.round(height/4)-0.5);	
	// 0 db line
	context.moveTo(0.5 + offsetLeft,Math.round(height/2)-0.5);
	context.lineTo(lenght,Math.round(height/2)-0.5);
	// 10 db line
	context.moveTo(0.5 + offsetLeft,Math.round(height*3/4)-0.5);
	context.lineTo(lenght,Math.round(height*3/4)-0.5);

	context.strokeStyle = lineColor;
	context.stroke();
	// scaling
	for (var i = 1; i <= 3; i++) {
		for (var x = 1; x < 10; x++) {
			drawVertikalLine(context,calcPrewarping(x*(Math.pow(10,i))));
		}
	}

	drawVertikalLine(context,calcPrewarping(10000));
	drawVertikalLine(context,calcPrewarping(20000));

	// Hz axis
	context.font = " 10px sans-serif";
	context.fillStyle = textColor; // text color
	context.fillText("100Hz", scaleHzToCanvasPx(calcPrewarping(100)) - 15, height + offsetBottom - 30);
	context.fillText("1kHz", scaleHzToCanvasPx(calcPrewarping(1000)) - 10, height + offsetBottom - 30);
	context.fillText("10kHz", scaleHzToCanvasPx(calcPrewarping(10000)) - 12, height + offsetBottom - 30);
	context.fillText("20Kkz", scaleHzToCanvasPx(calcPrewarping(20000)) - 12, height + offsetBottom - 30);

	context.font = "bold 10px sans-serif";
	context.fillText("Christian Breitkreutz", offsetLeft, height + offsetBottom - 30);
	context.fillStyle = magnitudeColor; // text color
	context.fillText("Magnitude", lenght - 80,  17);	
	context.fillStyle = phaseColor; // text color
	context.fillText("Phase", lenght - 54,  30);

	// dB axis
	var dbValuesXPos = lenght + 15;
	context.font = "bold 13px sans-serif";
	context.fillStyle= magnitudeColor; // text color
	context.fillText(" 20 dB", dbValuesXPos, 10 );
	context.fillText(" 10 dB", dbValuesXPos, (height/4)+2.5 );
	context.fillText("  0 dB", dbValuesXPos, (height/2)+2.5);
	context.fillText("-10 dB", dbValuesXPos, (height*3/4)+2.5 );
	context.fillText("-20 dB", dbValuesXPos, height );

	// degree axis
	var degreeValuesXPos = 5;
	context.font = " bold 13px sans-serif";
	context.fillStyle = phaseColor; // text color
	context.fillText(" 180°", degreeValuesXPos, 10 );
	context.fillText("  90°", degreeValuesXPos, (height/4)+2.5 );
	context.fillText("   0°", degreeValuesXPos, (height/2)+2.5);
	context.fillText(" -90°", degreeValuesXPos, (height*3/4)+2.5 );
	context.fillText("-180°", degreeValuesXPos, height );

	// frame
	var lineWidth = 3;
	context.beginPath();
	context.moveTo((lineWidth/2)  + offsetLeft, (lineWidth/2));
	context.lineTo((lenght-(lineWidth/2)), (lineWidth/2));
	context.lineTo((lenght-(lineWidth/2)), (height-(lineWidth/2)));
	context.lineTo((lineWidth/2) + offsetLeft,(height-(lineWidth/2)));
	context.lineTo((lineWidth/2) + offsetLeft, (lineWidth/2));
	context.lineWidth = lineWidth;
//	context.lineJoin = "round";
	context.strokeStyle = lineColor;
	context.stroke();
}


// ------------------------------------------------------------------------------------------

function drawVertikalLine(context,Hz){	
    var pos = scaleHzToCanvasPx(Hz);
    context.beginPath();
	context.moveTo(pos-0.5 ,0.5 );
	context.lineTo(pos-0.5 , (height-0.5));
	context.strokeStyle = lineColor;
	context.stroke();
}


// ------------------------------------------------------------------------------------------

function scaleHzToCanvasPx(Hz){
	var pos = Math.log(Hz/22050)/Math.log(10); 				// scale to 22050 Hz
		pos = pos - Math.log(10/22050)/Math.log(10); 		// 10 Hz is the lowest frequency
		pos /= -1 * Math.log(10/22050)/Math.log(10); 		// scale between 0 <-> 1 
		pos *= lenght - offsetLeft - lineWidth;			 	// scale to canvas minus offset and linewidth
		pos += offsetLeft;					 				// shift everything to the right by offset
		pos = Math.round(pos);								// skip subpixels
		
		//	if pos is out of the diagram but inside of the HTML5 canvas or if pos is negativ (it is posible with aliasing frequencys)
		if(pos >= lenght || Hz <= 0){												
			pos = lenght + offsetLeft + offsetRight + 100 ;	// position outside of the canvas
		}
	return pos;
}


// ------------------------------------------------------------------------------------------

function scaleCanvasPxToHz(pos){
		var Hz = pos - offsetLeft ;
		 	Hz /= (lenght-offsetLeft - lineWidth);
			
			Hz *= -Math.log(10/22049)/Math.log(10);
			Hz += Math.log(10/22049)/Math.log(10);
			Hz = Math.pow(10,Hz)*22049;
	return Hz;
}


// ------------------------------------------------------------------------------------------

function magnitudeEq (value){
	return temp = Math.sqrt(Math.pow(getBiquadRealPart(value),2) +  Math.pow(getBiquadImaginaryPart(value),2));
}


// ------------------------------------------------------------------------------------------

function magnitudePlotEq(value){
	var temp = magnitudeEq (scaleCanvasPxToHz(value));
		temp = 20 * Math.log(temp)/Math.log(10);									// convert logarithmically
		temp = (((height/2)- (temp/20) *((height/2)-lineWidth)));					// convert to canvas size
 return temp;
}


// ------------------------------------------------------------------------------------------

function phaseEq (value){
	return  Math.atan2(getBiquadImaginaryPart(value),getBiquadRealPart(value));
}


// ------------------------------------------------------------------------------------------

function phasePlotEq(value){
	var temp = phaseEq (scaleCanvasPxToHz(value));
		temp = 180*temp / Math.PI;													// convert from rad to degree
		temp = (((height/2)- temp/180*((height/2)-lineWidth )));					// convert to canvas size
 return temp;
}

// ------------------------------------------------------------------------------------------

function plot(){
	var temp = 0;
	var canvas = document.getElementById("Area");
	var context = canvas.getContext("2d");
	
	// phase plot

	temp = phasePlotEq (offsetLeft + lineWidth);

	context.beginPath();
	context.moveTo(lineWidth + offsetLeft,temp);	
	
	for(var i = (offsetLeft + lineWidth); i <= (lenght - lineWidth);i++){		
		temp = phasePlotEq (i);												// get Phase Value
				
			if(temp < (height -lineWidth)){									// if the value is out of diagram boundaries
				context.lineTo(i,temp );									// plot Phase
			}else{
				context.moveTo(i,height -lineWidth  );
			}
	}
	context.strokeStyle = phaseColor;
	context.lineWidth = lineWidth;
	context.lineCap = "round";
	context.stroke(); 

	// magnitude plot

	temp = magnitudePlotEq (offsetLeft + lineWidth);

	context.beginPath();
	context.moveTo(lineWidth + offsetLeft,temp);	

	for(var i = (offsetLeft + lineWidth); i <= (lenght - lineWidth);i++){		
		temp = magnitudePlotEq (i);											// get magnitude Value
				
			if(temp < (height -lineWidth)){									// if the value is out of diagram boundaries
				context.lineTo(i,temp );									// plot magnitude
			}else{
				context.moveTo(i,height -lineWidth  );
			}
	}
	context.strokeStyle = magnitudeColor;
	context.lineWidth = lineWidth;
	context.lineCap = "round";
	context.stroke(); 
	
	setNewCppText();														// set the copy text

}


// ------------------------------------------------------------------------------------------

function getValueFromElement(ElementName){
	var value = (document.getElementById(ElementName).value);	
	if (isNaN (value-0)){
		document.getElementById(ElementName).style.color=errorColor; 	// if value is NAN the text becomes red colored
		iscomputable = false;											// stop calculation
		return 0.0;
	}else{
		document.getElementById(ElementName).style.color= textColor;
		return parseFloat(value);
	}
}


// ------------------------------------------------------------------------------------------

function setValueToElement(value,elementName){
	document.getElementById(elementName).style.color = textColor;
	document.getElementById(elementName).style.background = backgroundColor;
	document.getElementById(elementName).style.border = " 1px solid"+textColor;
	document.getElementById(elementName).style.size = 13;
	document.getElementById(elementName).value = value;
}


// ------------------------------------------------------------------------------------------

function setNewParams(){
	b0 = getValueFromElement("B0");
	b1 = getValueFromElement("B1");
	b2 = getValueFromElement("B2");
	a1 = getValueFromElement("A1");
	a2 = getValueFromElement("A2");
	draw();
}


// ------------------------------------------------------------------------------------------

function calcPrewarping(crossrate){
	if (isPreWarped){
		var T = 1 / samplingRate;
		return ((2 / T) * Math.tan(2* Math.PI * crossrate * (T / 2)))/(2* Math.PI);
	}else{
		return crossrate;
	}
}


// ------------------------------------------------------------------------------------------

function printPrewarping(){
	var temp = Math.round(preWarpedCrossrate*1000)/1000;
	if (temp >= 192000){
		temp = "over 192000"  
	}
	if (isPreWarped == true){
		document.getElementById("prewarpText").innerHTML = "<tr><td> <font color= '"+ preWarpText +"'>" 
	  + temp + " Hz </font></td></tr>";
	}else{
		document.getElementById("CbPreWarping").checked = false;
		document.getElementById("prewarpText").innerHTML = "";
	}
}


// ------------------------------------------------------------------------------------------

function setPrewarping(value){
	isPreWarped = value.checked;
	calcNewParams();
}


// ------------------------------------------------------------------------------------------

function calcNewParams(){
    var crossrate = getValueFromElement("crossrate");
	var quality = getValueFromElement("quality");
	calcFilter(crossrate, quality);
	draw();
}


// ------------------------------------------------------------------------------------------

function setSamplerate(obj){
	samplingRate = obj.value;
	calcNewParams();
}

// ------------------------------------------------------------------------------------------

function setFilter(obj){
	filterType =  obj.value;
	calcNewParams();
}

// ------------------------------------------------------------------------------------------

function setNewCppText(){
	var cppValueName = document.getElementById("cppValueName").value;
	var cppDelay = document.getElementById("cppDelay").value;
	document.getElementById("cppCopyText").value = "(" +
	+ b0 +" * "+ cppValueName 
	+ " + " + b1 +" * "+ cppDelay+"[0]"
	+ " + " + b2 +" * "+ cppDelay+"[1]) / ( 1 "
	+ " + " + a1 +" * "+ cppDelay+"[2]"
	+ " + " + a2 +" * "+ cppDelay+"[3]);";
}


// ------------------------------------------------------------------------------------------

function calcFilter(crossrate, quality){
	if(iscomputable){
		setValueToElement(crossrate,"crossrate");
		setValueToElement(quality,"quality");

		if(isPreWarped == true){
			crossrate = calcPrewarping(crossrate);
			preWarpedCrossrate = crossrate;
		}

		var w0 = 2.0 * 3.14 * crossrate/samplingRate;
		var alpha = Math.sin(w0)/(2.0 * quality) 
		var a0 =   1 + alpha;
		
		switch(filterType){
			case "lowpass": 
				a1 =  ( -2*Math.cos(w0) )/ a0;
				a2 =  (  1 - alpha)/ a0;
				b0 =  ( (1 - Math.cos(w0))/2)/ a0;
				b1 =  (  1 - Math.cos(w0))/ a0;
				b2 =  ( (1 - Math.cos(w0))/2    )/ a0;  
				break;
			case "allpass":
            	a1 =   (-2*Math.cos(w0))/ a0;
            	a2 =  (  1 - alpha)/ a0;
				b0 =   ( 1 - alpha)/ a0;
           		b1 =  ( -2*Math.cos(w0))/ a0;
            	b2 =   ( 1 + alpha)/ a0;
				break; 
			case "highpass":
	            a1 = ( -2*Math.cos(w0))/ a0;
    	        a2 =  ( 1 - alpha)/ a0;
				b0 =  ((1 + Math.cos(w0))/2)/ a0;
           		b1 = (-(1 + Math.cos(w0)))/ a0;
            	b2 = ( (1 + Math.cos(w0))/2)/ a0;
				break;  
			case "bandpass":
				b0 =   (alpha)/ a0;
            	b1 =   0;
           		b2 =  (-alpha)/ a0;
            	a1 =  (-2*Math.cos(w0))/ a0;
            	a2 =   (1 - alpha)/ a0;
            	break;
            case "notch":
				b0 =  ( 1)/ a0;
            	b1 =  (-2*Math.cos(w0))/ a0;
            	b2 =  ( 1)/ a0;
            	a1 = ( -2*Math.cos(w0))/ a0;
            	a2 =  ( 1 - alpha)/ a0;
				break;

		}
		 
		setValueToElement(b0,"B0");
		setValueToElement(b1,"B1");
		setValueToElement(b2,"B2");
		setValueToElement(a1,"A1");
		setValueToElement(a2,"A2");
	}
}


// ------------------------------------------------------------------------------------------

// this special part  is justified in a faster transformation from  WxMaxima to javascript

function sin(value){
	return Math.sin(value);
}


// ------------------------------------------------------------------------------------------

function cos(value){
	return Math.cos(value);
}


// ------------------------------------------------------------------------------------------

function sqrt(value){
	return Math.sqrt(value);
}


// ------------------------------------------------------------------------------------------

function pow(value){
	return Math.pow(value,2);
}


// ------------------------------------------------------------------------------------------

function getBiquadImaginaryPart(value){
var pi = Math.PI;
var samplerate = samplingRate;
return  (((a1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(a2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+1)*(-(b1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))-(2*b2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate))))))+((b1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(b2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+b0)*((a1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(2*a2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))))/(pow(-(a1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))-(2*a2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate))))))+ pow((a1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(a2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+1));
}


// ------------------------------------------------------------------------------------------

function getBiquadRealPart(value){
var pi = Math.PI;
var samplerate = samplingRate;
return  (((a1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(a2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/pow ( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+1)*((b1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(b2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/ pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+b0)-((a1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(2*a2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate))))))*(-(b1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))-(2*b2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))))/(pow(-(a1*sin((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))-(2*a2*cos((2 * pi * (value /samplerate)))*sin((2 * pi * (value /samplerate))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate))))))+pow((a1*cos((2 * pi * (value /samplerate))))/( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+(a2*( pow(cos((2 * pi * (value /samplerate))))- pow(sin((2 * pi * (value /samplerate))))))/pow( pow(sin((2 * pi * (value /samplerate))))+ pow(cos((2 * pi * (value /samplerate)))))+1))
}

// ==========================================================================================
// 						end of file
// ==========================================================================================
