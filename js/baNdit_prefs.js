function GetPref(prefName, defaultValue) { if(localStorage[prefName]) return JSON.parse(localStorage[prefName]); return defaultValue;}
function SetPref(prefName, prefValue) { localStorage[prefName] = JSON.stringify(prefValue); }
