function createMyTurtle(){
	var t = createTurtle();
	t.ifOnEdgeThenBounce = function (d) {
        if (d < 0) {
            t.bk(-d);
        } else {
            jsCRiPS.th = Thread.create(function (d, t) {
                var xx = t.x,
                    yy = t.y;
                var dx = Math.cos(deg2rad(t.angle));
                var dy = Math.sin(deg2rad(t.angle));
                var tc = document.getElementById('turtleCanvas');
                var tmpIdx = 0;
                t.setRxRy();
                for (var i = jsCRiPS.moveStep; i < d; i += jsCRiPS.moveStep) {
                    t.x = xx + dx * (i-tmpIdx);
                    t.y = yy + dy * (i-tmpIdx);
                    if(t.x > tc.width){
                    	t.x = tc.width-1;
						t.angle+=180;
						tmpIdx=i;
                    	xx = t.x;
                    	dx = Math.cos(deg2rad(t.angle))
                    }else if(t.x < 0){
                    	t.x = 1;
						t.angle+=180;
						tmpIdx=i;
                    	xx = t.x;
                    	dx = Math.cos(deg2rad(t.angle))
                    }
                    if(t.y > tc.height){
                    	t.y = tc.height-1;
						t.angle+=180;
						tmpIdx=i;
                    	yy = t.y;
                    	dy = Math.sin(deg2rad(t.angle))
                    }else if(t.y < 0){
                    	t.y = 1;
               		t.angle+=180;
                		tmpIdx=i;
                    	yy = t.y;
                    	dy = Math.sin(deg2rad(t.angle))
                    }
                    draw(t);
                    t.setRxRy();
                    Thread.sleep(jsCRiPS.sleepTime);
                }
                t.x = xx + dx * (d-tmpIdx);
                t.y = yy + dy * (d-tmpIdx);
                draw(t);
            }, d, t);
        }
    };
    return t;
}