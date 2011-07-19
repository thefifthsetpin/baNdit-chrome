if(!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g,"");
    }
}

if(!String.prototype.format) {
    String.prototype.format = function() {
        var argLen = arguments.length;

        if( argLen == 0 ) return this;

        var str = this;
        for(var i = 0; i < argLen; i++)
        {
            var re = new RegExp('\\{' + i + '\\}','gm');
            str = str.replace(re, arguments[i]);
        }

        return str;
    }
}

if(!String.format) {
    String.format = function(str) {
        return String.prototype.format.apply(str, Array.prototype.slice.call(arguments, 1));
    }
}

function baNdit_unique(array) {
	var a = [];

	for(var i = 0, l = array.length; i<l; i++) 
	{
		if(a.indexOf(array[i]) < 0) 
		{ 
			a.push(array[i]); 
		}
	}

	return a;
}

function variablize(s)
{
	return s.replace(/[^A-Za-z0-9]/gi, '').replace(/^([0-9])/, '_$1');
}

function stringNotEmpty(s)
{
	if(!s) return false;
	if(s == null) return false;
	if(s.trim().length <= 0) return false;
	
	return true;
}