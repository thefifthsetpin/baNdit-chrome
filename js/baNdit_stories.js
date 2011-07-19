var showIgnoreStoriesForm = GetPref("showIgnoreStoriesForm", false);

if(showIgnoreStoriesForm == true)
{
	InjectIgnoreStoriesForm();
}

// TODO: Let users set this
SetPref("showIgnoreStoriesForm", true);

function GetIgnoreStoriesFormHTML() {
	return '<table>\
	    <tr>\
		<td class="form">\
		    <form id="ignoreStoryForm" >\
			<label for="textToIgnore">Ignore stories containing:</label>\
			<input name="textToIgnore" id="textToIgnore" type="text" />\
			<label id="textToIgnoreStatus">&nbsp;</label>\
		    </form>\
		</td>\
		<td class="currently_ignored">\
		    Currently ignored - Click links to unignore, and add headline words to ignore using the box to the left<br /><br />\
		    <div id="ignoredStories" />\
		</td>\
	    </tr>\
	</table>';
}

function InjectIgnoreStoriesForm() {
	if($("table#stories").length > 0 && $("div#ignoreStories").length == 0)
	{
		$("<div />")
			.attr("id", "ignoreStories")
			.html(GetIgnoreStoriesFormHTML())
			.insertBefore($("table#stories"));

	}

	$("#ignoreStoryForm").submit(IgnoreStoryContaining);
}

function IgnoreStoryContaining() { 
	var tb = $("#textToIgnore");
        var wordToIgnore = tb.val();
        var reIgnoreTest = /^(\-?)([\w\s]+)$/i;
        
        if(!reIgnoreTest.test(wordToIgnore))
        {
            $("#textToIgnoreStatus").html("Use 'word' or '-word'");

            return false;
        }
        
        var matches = reIgnoreTest.exec(wordToIgnore);
        
        var remove = matches[1].length > 0;
        var word = matches[2];
        
	ChangeIgnoredStories(remove, word);
        
        IgnoreStories();

        tb.val('');
	
        return false;
}

function ChangeIgnoredStories(remove, word) {
	if(remove) {
		RemoveWordToIgnore(word);
	}
	else {
		AddWordToIgnore(word);
	}
}

function RestoreAllStories() {
	$("a.baNdit_hiddenStory").show();
        $("#ignoredStories").empty();
}

function AddWordToIgnore(word) {
	var pref = GetPref("ignoreStoriesContaining", {words:[]});
	var words_array = pref.words || [];

	words_array.push(word);
	
	pref.words = baNdit_unique(words_array);
	
	SetPref("ignoreStoriesContaining", pref);
}

function RemoveWordToIgnore(word) {
	var pref = GetPref("ignoreStoriesContaining", {words:[]});
	var words_array = pref.words || [];
	var index = words_array.indexOf(word);
	
	if(index < 0) return;
	
	words_array.splice(index, 1);
	
	pref.words = baNdit_unique(words_array);
	
	SetPref("ignoreStoriesContaining", pref);
}

function GetIgnoredHeadlineWords() { 
	var pref = GetPref("ignoreStoriesContaining", {words:[]});
	return pref.words;
}

function RestoreStory() { 
	var linkClicked = $(this);
	var storyTagToRestore = linkClicked.attr("storyTag");
	var word = linkClicked.attr("word");

	RemoveWordToIgnore(word);

	$("." + storyTagToRestore).removeClass(storyTagToRestore).show();
	linkClicked.remove();        
}
    
function IgnoreStories() {
	RestoreAllStories();
        
        var ignoredWords = GetIgnoredHeadlineWords();

        if(ignoredWords.length == 0) return;

        var ignoredStoriesDiv = $("div#ignoredStories");
        
        if(ignoredStoriesDiv.length == 0)
        {
            return;
        }

        for(var i = 0, l = ignoredWords.length; i < l; i++)
        {
		if(ignoredWords[i].length == 0) continue;

		var storyHideClass = "baNdit_hiddenStory_{0}".format(variablize(ignoredWords[i]));
		
		var reIgnoreWord = new RegExp(ignoredWords[i], "i");

		var storiesContainingWord = $("table#stories a.storylink").filter(function(){
			return reIgnoreWord.test($(this).text());
		}).parents("tr");

		storiesContainingWord.addClass(storyHideClass);
		storiesContainingWord.hide();

		// Make sure we don't add them twice
		if($("a.{0}".format(storyHideClass)).length > 0)
		{
			continue;
		}            

		$("<a />")
			.addClass("baNdit_hiddenStory")
			.attr("href", "javascript:void(0);")
			.attr("storyTag", storyHideClass)
			.attr("word", ignoredWords[i])
			.attr("title", "Click to unignore stories containing {0}".format(ignoredWords[i]))
			.html("{0} ({1})".format(ignoredWords[i], storiesContainingWord.length))
			.click(RestoreStory)
			.appendTo(ignoredStoriesDiv);
        }
	
	alert("Finished ignoring stories");
}