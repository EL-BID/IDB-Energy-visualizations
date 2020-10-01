	function plainPath (x,y,r) {
		return "M"+x+","+y+" "+
		"m"+ (-r) +", 0"+
    	"a"+r+","+r+" 0 1,0 "+(r * 2)+",0" +
    	"a"+r+","+r+" 0 1,0 "+(-r * 2)+",0";
	}
	function trianglePath(x,y,r,angle) {
		angle = (angle || 0)* Math.PI / 180;
		var x0 = r*Math.cos(angle);
		var y0 = r*Math.sin(angle);
		var x1 = r*Math.cos(angle+Math.PI*0.72);//r*Math.cos(angle+Math.PI*0.67);
		var y1 = r*Math.sin(angle+Math.PI*0.72);
		var x2 = r*Math.cos(angle+Math.PI*1.28);
		var y2 = r*Math.sin(angle+Math.PI*1.28);
		return "M"+x+","+y+" m"+x0+","+y0+" l"+(x1-x0)+","+(y1-y0)
		       +" l"+(x2-x1)+","+(y2-y1)+" l"+(x0-x2)+","+(y0-y2);

	}

	function roundTrianglePath(x,y,r,angle) {
		angle = (angle || 0)* Math.PI / 180;
		var x0 = r*Math.cos(angle);
		var y0 = r*Math.sin(angle);
		var x1 = r*Math.cos(angle+Math.PI*(0.67-0.1));
		var y1 = r*Math.sin(angle+Math.PI*(0.67-0.1));
		var x2 = r*Math.cos(angle+Math.PI*(1.33+0.1));
		var y2 = r*Math.sin(angle+Math.PI*(1.33+0.1));
		return "M"+x+","+y+" m"+x0+","+y0
				+" l"+(x1-x0)+","+(y1-y0)
		        +/*" l"+*/ " a"+r+" "+r+" 0 0,1 "+(x2-x1)+","+(y2-y1)
		        +" l"+(x0-x2)+","+(y0-y2);

	}

	function coffeePath (x,y,r,angle,gap) {
		angle = (angle || 0) * Math.PI / 360;
		gap = (gap || 10) * Math.PI / 180;
		var x0 = x+r*Math.cos(angle+gap/2);
		var y0 = y+r*Math.sin(angle+gap/2);
		var x1 = x+r*Math.cos(angle+Math.PI-gap/2);
		var y1 = y+r*Math.sin(angle+Math.PI-gap/2);
		var x2 = x+r*Math.cos(angle+Math.PI+gap/2);
		var y2 = y+r*Math.sin(angle+Math.PI+gap/2);
		var x3 = x+r*Math.cos(angle+Math.PI*2-gap/2);
		var y3 = y+r*Math.sin(angle+Math.PI*2-gap/2);
		var d = "M"+x0+","+y0+" ";
		d += "A"+r+" "+r+" 0 0,1 ";
		d += x1+","+y1+" ";
		d += "L"+x0+","+y0;
		d += "M"+x2+","+y2+" ";
		d += "A"+r+" "+r+" 0 0,1 ";
		d += x3+","+y3+" ";
		d += "L"+x2+","+y2;
		return d;
	}
	function pacmanPath (x,y,r,angle,gap) {
		angle = (angle || 0) * Math.PI / 180;
		gap = (gap || 100) * Math.PI / 180;
		var x0 = x+r*Math.cos(angle+gap/2);
		var y0 = y+r*Math.sin(angle+gap/2);
		var x1 = x+r*Math.cos(angle+Math.PI*2-gap/2);
		var y1 = y+r*Math.sin(angle+Math.PI*2-gap/2);
		var l = r-r*Math.sin(gap/2)*Math.sqrt(2);
		var xc = x+l*Math.cos(angle);
		var yc = y+l*Math.sin(angle);
		var d = "M"+x0+","+y0+" ";
		d += "A"+r+" "+r+" 0 1,1 ";
		d += x1+","+y1+" ";
		d += "L"+xc+","+yc+"z";
		return d;
	}
