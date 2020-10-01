    // Given the x or y coordinate of Bézier control points a,b,c,d and
    // the value of the t parameter, return the corresponding
    // coordinate of the point
    function bezierPoint (a,b,c,d,t) {
        var u = 1.0 - t;
        return a*u*u*u + b*3*u*u*t + c*3*t*t*u + d*t*t*t
    }

    // Given the x or y coordinate of Bézier control points a,b,c,d and
    // the value of the t parameter, return the corresponding
    // coordinate of the tangent at that point."""
    function bezierTangent (a,b,c,d,t) {
        var u = 1.0 - t;
        return -a*3*u*u + b*(9*u*u-6*u) + c*(6*t-9*t*t) + d*3*t*t
    }

    // A smooth interpolation function: maps [0..1] onto [0..1]
    // with horizontal tangents near 0 and 1
    function smoothStep (x) {
        return x*x*(3 - 2*x);
    }

    // Returns a polygonal line with n vertices which is the
    // offset at distance d of a Bézier curve given by control points q0..q3.
    // Also sets variable isDegenerate as true/false depending on whether or
    // not the resulting curve has auto-intersection.
    var isDegenerate;
    var offsetBezier = function (q0x, q0y, q1x, q1y, q2x, q2y, q3x, q3y, n, d) {
        var ret = [];
        isDegenerate = false;
        // Compute a 'magic' factor for reducing d near the middle of the curve.
        // This is to be 1 for near horizontal lines and 0.4 for steep lines
        // - the smaller the magic the bigger the effect.
        var ydifference = Math.abs(Math.atan2(q3y-q0y,q3x-q0x)/Math.PI);
        var magic = 1*(1-ydifference)+0.9*(ydifference);
        var x0 = q0x, y0 = q0y;
        for (var i = 0; i < n; i++) {
            var t = i * 1.0 / (n-1);
            var tgx = bezierTangent(q0x,q1x,q2x,q3x,t);
            var tgy = bezierTangent(q0y,q1y,q2y,q3y,t);
            // Normal
            var nrx = -tgy;
            var nry = tgx;
            var sz = Math.sqrt (nrx*nrx+nry*nry);
            nrx /= sz;
            nry /= sz;
            // Point 
            var ptx = bezierPoint(q0x,q1x,q2x,q3x,t);
            var pty = bezierPoint(q0y,q1y,q2y,q3y,t);
            // Offset point
            //var distFromMiddle = smoothStep(Math.abs((ptx-q0x)/(q3x-q0x) - 0.5)/0.5);
            var distFromMiddle = smoothStep (Math.abs(t-0.5)/0.5);
            var dmagic = d*distFromMiddle+d*magic*(1-distFromMiddle);
            var x = ptx + nrx*dmagic, y = pty + nry*dmagic;
            if (x < q0x || x > q3x) {
                isDegenerate = true;
            }
            ret.push ([x, y]);
        }
        return ret;
    };

    // Computes an offset flow line between the two points
    var avoidDegenerate = true;
    var offsetFlowLine = function (x0,y0,x1,y1,npts,offset) {
        var delta = 0.5 * smoothFactor;
        var midx1 = x0 * (1 - delta) + x1 * (delta);
        var midx2 = x0 * delta + x1 * (1-delta);
        var pts = offsetBezier(x0,y0,midx1,y0,midx2,y1,x1,y1,npts,offset); 
        var dy = offset*0.1;
        var dx = (midx1-x0)*0.08;
        for (var i = 0; i < 10 && isDegenerate && avoidDegenerate; i++) {
            y0 += dy;
            y1 += dy;
            offset -= dy;
            if (y0<y1) {
                midx1-=dx;
            } else {
                midx2+=dx;
            }
            pts = offsetBezier(x0,y0,midx1,y0,midx2,y1,x1,y1,npts,offset); 
        }
        return pts;
    };


    // Returns the approximate center of a path
    function pathCenter(path) {
        var re = /L\s*([\d\.]*),([\d\.]*)/g;
        var m;
        var pts = [];
        while (m = re.exec(path)) {
            x = parseFloat(m[1]);
            y = parseFloat(m[2]);
            pts.push ([x,y]);
        }
        var n = pts.length;
        var height = Math.abs(pts[0][1] - pts[n-1][1]);
        var m = ~~(n/2);
        pts.splice(m,n-m);
        pts.sort (function (a,b) { return a[0] - b[0] });
        var mid = pts[Math.floor(pts.length/2)];
        return [mid[0],mid[1]+height/2];
    }

    // Returns the path data for a polygon computed as an offset of
    // a bezier flow curve that starts at x0,y0 , ends at x1,y1 and
    // has horizontal tangents. 
    // The path is offset d units from the curve and has thickness sz.
    // The path data contains a newline character separating the two main strokes.
    function offsetFlow (x0, y0, x1, y1, d, sz) {
        var off1 = offsetFlowLine (x0, y0, x1, y1, 40, d);
        var ret = "M "+x0+","+(y0+d);
        for (var i = 0; i < off1.length; i++) {
            var p = off1[i];
            ret += "L "+p[0]+","+p[1]+" ";
        }
        ret += "L "+x1+","+(y1+d);
        ret += "\n";
        var off2 = offsetFlowLine (x0, y0, x1, y1, 40, d+sz);
        ret += "L "+x1+","+(y1+d+sz);
        for (var i = off2.length-1; i >=0; i--) {
            var p = off2[i];
            ret += "L " + p[0]+","+p[1]+" ";
        }
        ret += "L "+x0+","+(y0+d+sz);
        return ret + "z";
    }

    /*
        function offsetFlow (x0, y0, x1, y1, d, sz) {
        var delta = 0.5 * smoothFactor;
        var a = x0 * (1 - delta) + x1 * (delta);
        var b = x0 * delta + x1 * (1-delta);
        var off1 = offsetBezier (x0, y0, a, y0, b, y1, x1, y1, 40, d);
        var ret = "M "+x0+","+(y0+d);
        var prev = [x0,y0+d];
        var testLower = function (q) { return q[0] >= prev[0] && q[1] <= prev[1]; }
        var testHigher = function (q) { return q[0] >= prev[0] && q[1] >= prev[1]; }
        var test = y1 > y0 ? testHigher : testLower;
        for (var i = 0; i < off1.length; i++) {
            var p = off1[i];
            if (test (p) && p[0] <= x1) {
                ret += "L "+p[0]+","+p[1]+" ";
                prev = p;
            }
        }
        ret += "L "+x1+","+(y1+d);
        ret += "\n";
        var off2 = offsetBezier (x0, y0, a, y0, b, y1, x1, y1, 40, d+sz);
        ret += "L "+x1+","+(y1+d+sz);
        prev = [x1,y1+d+sz];
        testLower = function (q) { return q[0] <= prev[0] && q[1] <= prev[1]; }
        testHigher = function (q) { return q[0] <= prev[0] && q[1] >= prev[1]; }
        test = y1 > y0 ? testLower : testHigher;
        for (var i = off2.length-1; i >=0; i--) {
            var p = off2[i];
            if (test (p) && p[0] >= x0) {
                ret += "L " + p[0]+","+p[1]+" ";
                prev = p;
            }
        }
        ret += "L "+x0+","+(y0+d+sz);
        return ret + "z";
    }
    */

    //
    // Stitches together two flow paths so that they are drawn as a 
    // single path
    function stitchPathData (path1, path2) {
        var a = path1.split("\n");
        var b = path2.split("\n");
        return a[0]+"L"+b[0].substring(1)+"\n"+
               b[1].slice(0,-1)+a[1];
    }

    // How much to try to smooth the arc (0 = None, 1 = max)
    var smoothFactor = 1.0;

    // Returns path data for an arc of circle centered at (x,y) with radius r
    // between angles a0 and a1 (in radians)
    function circleArc (x, y, r, a0, a1) {
        var x0 = x + r * Math.cos(a0);
        var y0 = y + r * Math.sin(a0);
        var x1 = x + r * Math.cos(a1);
        var y1 = y + r * Math.sin(a1);
    
        var sweepFlag = (a1>a0) + 0; // 0 or 1
        var largeArcFlag = (Math.abs(a1-a0)>Math.PI) + 0; // 0 or 1
        return "L" + x0 + "," + y0 + " " +
               "A" + r + "," + r + " 0 " +
               largeArcFlag + "," + sweepFlag + " " +
               x1 + "," + y1 + " ";

    } 

    // Alternative algorithm, using a simple bezier function
    function bezierFlow (x0, y0, x1, y1, r) {

        var delta = 0.5 * smoothFactor;
        var a = x0 * (1 - delta) + x1 * (delta);
        var b = x0 * delta + x1 * (1-delta);
        return "M " + x0 + "," + y0 + " " +
               "C " + a + "," + y0 + " " 
                    + b + "," + y1 + " " + x1 + "," + y1 +
               "\n" +
               "L"  + x1 + "," + (y1+r) +
               "C " + b + "," + (y1+r) + " " 
                    + a + "," + (y0+r) + " " + x0 + "," + (y0+r) +
               " z";
    }
    
    // A useful value!
    var HALF_PI = Math.PI/2;

    // Returns path data for a flow line from a vertical segment 
    // with top endpoint at x0,y0
    // to another vertical segment at x1,y1 and thickness r
    // using a straight line beveled with arcs of circle,
    // but restricting the drawing to a strip between r1 and r2.
    // The path data contains a newline character separating the two main strokes.
    function arcFlowStrip (x0, y0, x1, y1, r, r1, r2) {
        // Adjustment in parameters so that distances are measured down rather than up
        y0 += r;
        y1 += r;
        r1 = r - r1;
        r2 = r - r2;
        var dx = x1-x0;
        var dy = y1-y0;
        var up = dy > 0;
        var dy = Math.abs(dy);
        var R = 0;
        if (dy < 1) R = 1000;
        else R = (dx*dx + dy*dy) / (2 * dy);
        var a = (R-r)/2;
        a = smoothFactor * a;
        y0 += a;
        y1 += a;
        r1 += a;
        r2 += a;
        r += 2*a;
        var b = Math.abs(dy-r);
        var D = Math.sqrt(b*b+dx*dx);
        var delta = Math.atan2(b,dx);
        var beta = 0;
        if (r<D) beta = Math.asin(r/D);
        else beta = Math.asin(D/r);
        var ang = 0;
        if (dy>r) ang = beta+delta; 
        else ang = beta-delta;
        var result = "";
        // Test for degenerate curves
        if (r1 > r || r2 > r) return fallback;
        if (up) {
            result += circleArc(x0,y0,r1,-HALF_PI,-HALF_PI+ang);
            result += circleArc(x1,y1-r,r-r1,HALF_PI+ang,HALF_PI);
            result += "\n"; 
            result += circleArc(x1,y1-r,r-r2,HALF_PI,HALF_PI+ang);
            result += circleArc(x0,y0,r2,-HALF_PI+ang,-HALF_PI);
        } else {
            result += circleArc (x0,y0-r,r-r1,HALF_PI, HALF_PI-ang);
            result += circleArc (x1,y1,r1,-HALF_PI-ang, -HALF_PI);
            result += "\n";
            result += circleArc (x1,y1,r2,-HALF_PI, -HALF_PI-ang);
            result += circleArc (x0,y0-r,r-r2,HALF_PI-ang, HALF_PI);
        }
        return "M" + result.substring(1) + "z";
    }

    // Returns path data for a flow line from a vertical segment 
    // with top endpoint at x0,y0
    // to another vertical segment at x1,y1 and thickness r
    // but restricting the drawing to a strip between r1 and r2.
    // The path data contains a newline character separating the two main strokes.
    // If point x2,y2 is defined, then the flow also visits that point.
    // If point x3,y3 is also defined, then the flow also visits that point.
    function flowStrip (x0, y0, x1, y1, r, r1, r2, x2, y2, x3, y3) {
        var path = offsetFlow (x0, y0+r/2.0, x1, y1+r/2.0, r1-r/2.0, r2-r1);
        if (x2 != undefined && y2 != undefined) {
            var path2 = offsetFlow (x1, y1+r/2.0, x2, y2+r/2.0, r1-r/2.0, r2-r1);
            path = stitchPathData (path, path2);
            if (x3 != undefined && y3 != undefined) {
                var path3 = offsetFlow (x2, y2+r/2.0, x3, y3+r/2.0, r1-r/2.0, r2-r1);
                path = stitchPathData (path, path3);
            }
        }
        return path;
    }


