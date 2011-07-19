const BanditIgnoreType = {
	NONE: 0,
	PAY_ATTENTION: 1,
	IGNORE_USER: 2,
	SUPERIGNORE_USER: 3,
};

const BanditIgnoreReplyType = {
    NONE : 0,
    ALL : 1,
    NON_ATTENTION : 2,
};

function GetDefaultUserOptions(username) {
	return {
		userName: username || "",
		notes: "",
		ignore: BanditIgnoreType.NONE,
		ignoreReplies: BanditIgnoreReplyType.NONE,
		bgColor: '',
		fgColor: '',
	};
}
function GetUserOptionsStorageName(username) {
	var stripped = variablize(username);
	
	return "options_{0}".format(stripped);
}
function GetUserOptions(username) {
	var storageName = GetUserOptionsStorageName(username);
	
	if(localStorage[storageName])
	{
		return JSON.parse(localStorage[storageName])
	}		

	return GetDefaultUserOptions(username);
}
function SaveUserOptions(dialog) {
	dialog = $(dialog);
	
	var dialogID = dialog.attr("id");
	var commentID = dialog.attr("commentID");
	var username = dialog.attr("username");
	
	var userOptions = GetUserOptions(username);
	
	// TODO: Fill in user options here
	userOptions.notes = $("#notes_{0}".format(dialogID)).val();
	userOptions.fgColor = $("#fgColor_{0}".format(dialogID)).val();
	userOptions.bgColor = $("#bgColor_{0}".format(dialogID)).val();
	userOptions.ignore = $('[name="ignore_{0}"]:checked'.format(dialogID)).val();
	userOptions.ignoreReplies = $('[name="ignoreReplies_{0}"]:checked'.format(dialogID)).val();
	
	var optionsStorageString = JSON.stringify(userOptions);
	var storageName = GetUserOptionsStorageName(username);

	localStorage[storageName] = optionsStorageString;
	
	return userOptions;
}

function PopulateUserOptions(dialog) {
	dialog = $(dialog);
	
	var dialogID = dialog.attr("id");
	var commentID = dialog.attr("commentID");
	var username = dialog.attr("username");
	
	var userOptions = GetUserOptions(username);

	$("#notes_{0}".format(dialogID))
		.val(userOptions.notes);
		
	$("#fgColor_{0}".format(dialogID))
		.val(userOptions.fgColor);
		
	$("#bgColor_{0}".format(dialogID))
		.val(userOptions.bgColor);
	
	$('[name="ignore_{0}"][value="{1}"]'.format(dialogID, userOptions.ignore || BanditIgnoreType.NONE))
		.attr("checked", true).focus();
	
	$('[name="ignoreReplies_{0}"][value="{1}"]'.format(dialogID, userOptions.ignoreReplies || BanditIgnoreReplyType.NONE))
		.attr("checked", true);
	
	UpdateIgnoreRadioButtons($('[name="ignore_{0}"]:checked'.format(dialogID)));
}

function GetUserOptionsDialogHTML(dialogID) {
	return '\
<fieldset id="ignore_{0}" class="half">\
	<legend>Attention/Ignore</legend>\
	<ol>\
		<li><input type="radio" id="ignore_{0}_0" name="ignore_{0}" value="0" /><label for="ignore_{0}_0">None</label></li>\
		<li><input type="radio" id="ignore_{0}_1" name="ignore_{0}" value="1" /><label for="ignore_{0}_1">Pay Attention</label></li>\
		<li><input type="radio" id="ignore_{0}_2" name="ignore_{0}" value="2" /><label for="ignore_{0}_2">Ignore User</label></li>\
		<li><input type="radio" id="ignore_{0}_3" name="ignore_{0}" value="3" /><label for="ignore_{0}_3">SuperIgnore User</label></li>\
	</ol>\
</fieldset>\
<fieldset id="ignoreReplies_{0}" class="half">\
	<legend>Ignore Replies</legend>\
	<ol>\
		<li><input type="radio" id="ignoreReplies_{0}_0" name="ignoreReplies_{0}" value="0" /><label for="ignoreReplies_{0}_0">Don\'t ignore replies to this user</label></li>\
		<li><input type="radio" id="ignoreReplies_{0}_1" name="ignoreReplies_{0}" value="1" /><label for="ignoreReplies_{0}_1">Ignore all replies to this user</label></li>\
		<li><input type="radio" id="ignoreReplies_{0}_2" name="ignoreReplies_{0}" value="2" /><label for="ignoreReplies_{0}_2">Ignore all replies to this user except those you\'re paying attention to</label></li>\
	</ol>\
</fieldset>\
<fieldset>\
	<legend>User Notes</legend>\
	<textarea id="notes_{0}" class="notes" rows="5"></textarea>\
</fieldset>\
<fieldset>\
	<legend>Colors</legend>\
	<ol>\
		<li>\
			<label for="fgColor_{0}">Foreground Color</label>\
			<input id="fgColor_{0}" type="text" class="color {required:false, pickerPosition:\'right\', hash:true}"></input>\
		</li>\
		<li>\
			<label for="bgColor_{0}">Background Color</label>\
			<input id="bgColor_{0}" type="text" class="color {required:false, pickerPosition:\'right\', hash:true}"></input>\
		</li>\
	</ol>\
</fieldset>'.format(dialogID);
}

function UpdateIgnoreRadioButtons(clickedIgnoreRadio) {
	clickedIgnoreRadio = $(clickedIgnoreRadio);
	
	var dialog = clickedIgnoreRadio.closest("div.baNdit_userDialog");
	var dialogID = dialog.attr("id");
	var value = parseInt(clickedIgnoreRadio.val()) || BanditIgnoreType.NONE;
	
	switch(value) {
		case BanditIgnoreType.NONE:
		case BanditIgnoreType.PAY_ATTENTION:
			$("fieldset#ignore_{0}".format(dialogID)).removeClass("half");
			$("fieldset#ignoreReplies_{0}".format(dialogID)).css("display", "none");
			break;
		case BanditIgnoreType.IGNORE_USER:
		case BanditIgnoreType.SUPERIGNORE_USER:
			$("fieldset#ignore_{0}".format(dialogID)).addClass("half");
			$("fieldset#ignoreReplies_{0}".format(dialogID)).css("display", null);
			break;
	}
}

function getDialogIDFromCommentID(commentID) {
	return "baNdit_dialog_{0}".format(commentID);
}

function CreateUserOptionsDialogs() {
	$('div.ch span.ui a').each(function(){
		var $profile_link = $(this);
		var username = $profile_link.text();
		var header = $profile_link.closest("div.ch");
		var commentID = null;
		
		if(header)
		{
			commentID = header.attr("id").substring(1);
		}
		
		var dialogID = getDialogIDFromCommentID(commentID);
		
		var $dialog = $("<div />")
						.attr("id", dialogID)
						.attr("class", "baNdit_userDialog")
						.attr("username", username)
						.attr("commentID", commentID)
						.html(GetUserOptionsDialogHTML(dialogID))
						.dialog({
							autoOpen: false,
							modal: true,
							title: 'Options for <a href="/users/{0}" title="Visit {0}\'s profile">{0}</a>'.format(username),
							width: "60%",
							buttons: {
								"Cancel": function() { $(this).dialog("close"); },
								"OK": function() { 
									var userOptions = SaveUserOptions(this);
									RefreshPageOnUserOptionsChanged(userOptions);
									$(this).dialog("close"); 
								}
							},
							open: function() {
								PopulateUserOptions(this);
							},
							beforeclose: function() {
								var colorInputs = this.getElementsByClassName('color');
								
								for(var i = 0; i < colorInputs.length; i++) {
									colorInputs[i].color.hidePicker();
								}
							},
						});
		
		$profile_link.click(function(){
			$dialog.dialog('open');
			
			return false;
		});
	});
	
	$("div.baNdit_userDialog input[id^='ignore_']")
		.click(function() { UpdateIgnoreRadioButtons(this); } );
}

// MAIN PAGE PROCESSING
var ThreadPosters = [];

function PreProcessCommentsPage() {
	$("div.cb").each(function() {
		var commentBody = $(this);
		var commentID = $(this).attr("id");
		var commentHeaderID = "#h{0}".format(commentID.substring(1));
		var commentHeader = $(commentHeaderID);
		
		var username = commentHeader.children("span.ui:first").text();

		ThreadPosters.push(username);
		
		commentHeader.attr("username", username);
		commentBody.attr("username", username);      
		
		commentBody.css("overflow", "auto");            
	});
	
	ThreadPosters = baNdit_unique(ThreadPosters);
}

function ForEachPoster(fn) {
	// fn must take a userOptions object as it's one parameter
	if(!fn || !ThreadPosters || ThreadPosters.length == 0) return;
	
	$.each(ThreadPosters, function() {
		var userOptions = GetUserOptions(this);

		if(!userOptions) continue;
		
		fn(userOptions); 
	});	
}

function InitializeUserNotes() {
	ForEachPoster(SetUserNotes);
}
function ClearUserNotes(username) { 
	$("div.ch[username='{0}'] span.ui a abbr".format(username)).each(function(){
		var node = $(this);
		var text = node.text();

		node.parent().html(text).css("text-decoration", null);
	});
}
function SetUserNotes(userOptions) {
	if(!userOptions) return;
	
	var needsUserNotes = stringNotEmpty(userOptions.notes);

	ClearUserNotes(userOptions.userName);

	if(!needsUserNotes) return;

	var fakeDiv = $("<div />");
	var abbrNode = $("<abbr />")
		.attr("title", userOptions.notes)
		.html(userOptions.userName);

	abbrNode.appendTo(fakeDiv);
	
	var abbrContent = fakeDiv.html();
	
	$("div.ch[username='{0}'] span.ui a".format(userOptions.userName))
		.each(function() {
			$(this)
				.css("text-decoration", "none")
				.html(abbrContent);
		});
}

function InitializeUserColors() {
	ForEachPoster(SetUserColors);
}

function ClearUserColors(username) {
	$("div.ch[username='{0}']".format(username))
		.css("background-color", null)
		.css("color", null);
}

function SetUserColors(userOptions) {
	if(!userOptions) return;
	
	ClearUserColors(userOptions.userName);

	$("div.ch[username='{0}']".format(userOptions.userName))
		.each(function() {
			$(this)
				.css("background-color", userOptions.bgColor || null)
				.css("color", userOptions.fgColor || null);
			
			$(this).find("*")
				.css("background-color", userOptions.bgColor || null)
				.css("color", userOptions.fgColor || null);
		});
}

function PayAttentionToUser(userOptions) {
	if(!userOptions) return;
	
	UnmarkUserToPayAttention(userOptions.userName);
	
	var ignore = parseInt(userOptions.ignore) || BanditIgnoreType.NONE;
	
	if(ignore == BanditIgnoreType.PAY_ATTENTION) {
		MarkUserToPayAttention(userOptions.userName);
	}
}

function InitializePaidAttentionUsers() {
	ForEachPoster(PayAttentionToUser);
}

function InitializeIgnoredUsers() {
	ForEachPoster(RedisplayUser);
	ForEachPoster(IgnoreUsers);
}

function RedisplayUser(userOptions) {
	var username = userOptions.userName;
	$("div.ch[username='{0}'],div.cb[username='{0}']".format(username)).show();
	$("div.ch[username='{0}'] span.baNdit_hide".format(username)).remove();
	$("hr.baNdit_superIgnore[username='{0}']".format(username)).remove();
}

function UnmarkUserToPayAttention(username) { 
	$("div.ch[username='{0}'] span.attention".format(username)).remove();
}

function MarkUserToPayAttention(username) {
	$("div.ch[username='{0}']".format(username)).each(function() {
		$("<span />")
			.addClass("attention")
			.attr("title", "You're paying attention to this user for some reason. Maybe you meant to donate money to them via the baNdit homepage, for values of \"them\" equalling \"bonus_eruptus\".")
			.append($("<img />").attr("src", chrome.extension.getURL("/img/bullet_star.png")))
			.prependTo($(this).children("span.ui:first"));
	});
}

function GetCommentScore(commentHeader) {
	var score = 0;

	var scoreSpans = $(commentHeader).children("span.score");
	
	if(scoreSpans.length == 0) 
	{
		return score;
	}
	
	var scoreSpan = scoreSpans.eq(0);
		
	var scoreFromRegex = /score (\d+)/.exec(scoreSpan.text());
	
	if(scoreFromRegex)
	{
		return parseInt(scoreFromRegex[1]);
	}
	
	// Get score from naBBit
	$(scoreSpan.children("img[alt]")).each(function()
	{
		if(score > 0) return;
		var img = $(this);
		
		if(/naBBit/.test(img.attr("src"))) 
		{
			score = parseInt(img.attr("alt"));
		}
	});
	
	return score;
}

function MarkPostsAboveCoolScore() {
	// TODO: See if you can hook into the dynamic stuff grahams does and update with that
	// TODO: Set up global preferences
	var coolPostsMarkerThreshold = 5;
        
	$("div.ch").filter(function(){
		return GetCommentScore(this) >= coolPostsMarkerThreshold;
	}).each(function(){
		$("<span />")
			.addClass("baNdit_awesome")
			.attr("title", "This post was marked because its cool score was at least {0}.".format(coolPostsMarkerThreshold))
			.append($("<img />")
					.attr("src", chrome.extension.getURL("img/bullet_green.png")))
			.prependTo($(this).children("span.ui:first"));
	});
}

function ShowCommentOnClick() {
	var commentHeader = $(this).closest("div.ch");
	$(this).remove();
	
	var headerID = "#" + commentHeader.attr("id");
	var bodyID = headerID.replace(/^#h/, '#c');
	
	$(bodyID)
		.addClass("unignored")
		.show();

	$(headerID)
		.addClass("unignored")
		.show();
}

function IgnoreComment() {
	var headerID = $(this).attr("id");

	if($(this).find("span.baNdit_hide").length > 0) return;
	if($(this).hasClass("unignored")) return;
	
	$("<span />")
		.click(ShowCommentOnClick)
		.addClass("baNdit_hide")
		.attr("title", "Click to un-hide this comment")
		.append(
			$("<img />")
				.attr("src", chrome.extension.getURL("/img/icon_eyeball.png"))
		).prependTo($(this).children("span.ui:first"));
	
	var bodyID = headerID.replace(/^h/, '#c');

	$(bodyID).hide();
}

function SuperIgnoreComment() {
	var headerID = $(this).attr("id");
	var username = $(this).attr("username");
	var commentID = headerID.substring(1);
	var superIgnoreID = "baNdit_superIgnore_{0}".format(commentID);
	var dialogID = getDialogIDFromCommentID(commentID);

	if($("#{0}".format(superIgnoreID)).length > 0) return;

	$("<hr />")
		.click(function(){
			$("#{0}".format(dialogID)).dialog('open');
		}).addClass("baNdit_superIgnore")
		.attr("id", superIgnoreID)
		.attr("username", username)
		.insertAfter("#{0}".format(headerID));
	
	$(this).hide();

	var bodyID = headerID.replace(/^h/, '#c');

	$(bodyID).hide();
}

// TODO: Currently won't redisplay replies when changing to None while superIgnoring

function IgnoreRepliesToComment() {
	var commentID = $(this).attr("id").substring(1);

	$("div.cb:has(a[href='#{0}'])".format(commentID)).each(function() {
		var headerID = $(this).attr("id").replace(/^c/, 'h');

		$("#{0}".format(headerID)).each(IgnoreComment);
	});
}

function IgnoreNonAttentionRepliesToComment() {
	var commentID = $(this).attr("id").substring(1);

	$("div.cb:has(a[href='#{0}'])".format(commentID)).each(function() {
		var headerID = $(this).attr("id").replace(/^c/, 'h');

		$("#{0}:not(:has(.attention))".format(headerID)).each(IgnoreComment);
	});
}

function IgnoreUser(username) {
	$("div.ch[username='{0}']".format(username)).each(IgnoreComment);
}

function IgnoreAllRepliesTo(username) {
	$("div.ch[username='{0}']".format(username)).each(IgnoreRepliesToComment);
}

function IgnoreAllNonAttentionRepliesTo(username) {
	$("div.ch[username='{0}']".format(username)).each(IgnoreNonAttentionRepliesToComment);
}

function SuperIgnoreUser(username) {
	$("div.ch[username='{0}']".format(username)).each(SuperIgnoreComment);
}

// TODO: Add "Ignored users in this thread" to toolbar button
function IgnoreUsers(userOptions) {
	var ignore = parseInt(userOptions.ignore) || BanditIgnoreType.NONE;
	
	switch(ignore) {
		case BanditIgnoreType.IGNORE_USER:
			IgnoreUser(userOptions.userName);
			IgnoreReplies(userOptions);
			break;
		case BanditIgnoreType.SUPERIGNORE_USER:
			SuperIgnoreUser(userOptions.userName);
			IgnoreReplies(userOptions);
			break;
	}
}

function IgnoreReplies(userOptions) {
	var ignoreReplies = parseInt(userOptions.ignoreReplies) || BanditIgnoreReplyType.NONE;
	
	switch(ignoreReplies) {
		case BanditIgnoreReplyType.NONE:
			break;
		case BanditIgnoreReplyType.ALL:
			IgnoreAllRepliesTo(userOptions.userName);
			break;
		case BanditIgnoreReplyType.NON_ATTENTION:
			IgnoreAllNonAttentionRepliesTo(userOptions.userName);
			break;
	}
}

function RefreshPageOnUserOptionsChanged(userOptions) {
	if(!userOptions) return;
	
	SetUserNotes(userOptions);
	SetUserColors(userOptions);
	PayAttentionToUser(userOptions);
	RedisplayUser(userOptions);
	IgnoreUsers(userOptions);
	// TODO: refresh page for other options
}

function HandleToolbarClick() {
	event.preventDefault();

	// Here, "this" refers to the button pressed 
	var button = $(this);
	var value = button.attr("value");
	
	switch(value) 
	{
		case 'b':
		case 'i':
		case 'strike': 
		{
			HTMLToolbar_WrapSelectionWithTag(value);
			break;
		}
		case 'a': 
		{
			HTMLToolbar_AddLink();
			break;
		}
		case 'img': 
		{
			HTMLToolbar_AddImage();
			break;
		}                
		default: 
		{
			alert("Not implemented yet!");
			return; // do nothing
		}
	}    
}

function HTMLToolbar_WrapSelectionWithTag(tagType) { 
	var commentBox = GetCommentBox();
	
	var selection = commentBox.getSelection();

	var newValue = ("<{0}>{1}</{0}>".format(tagType, selection.text));
	
	commentBox.replaceSelection(newValue);
	commentBox.get(0).setSelectionRange(selection.start, selection.start + newValue.length);
}

function IsImage(url) {
	var reImageContentType = /image\/(jpeg|pjpeg|gif|png|bmp)/i;
	var reLooksLikeImage = /\.(jpg|jpeg|gif|png|bmp)/i;
	
	if(!reLooksLikeImage.test(url)) 
	{
		return false;
	}
	
	return true;
	// TODO: Figure out how to make synchronous code wait for asynchronous event (see xhrproxy.js)
	proxyIsImage({
		url: url,
		timeout: 1000
	});

	return baNdit_isImage;
}

function IsURL(url) {
	var urlDetectionShortFormat = /^((?:http:|https:|ftp:)\/\/\S+)$/i;
	
	return urlDetectionShortFormat.test(url);
}

function GetHTMLTagDialogHTML() {
	return '\
<table>\
	<tr>\
		<td class="label"><label for="baNdit_linkText">Link Text</label></td>\
		<td class="input"><input id="baNdit_linkText" type="text"></input></td>\
	</tr>\
	<tr>\
		<td class="label"><label for="baNdit_linkURL">URL</label></td>\
		<td class="input"><input id="baNdit_linkURL" type="text"></input></td>\
	</tr>\
</table>';
}

function GetIMGTagDialogHTML() {
	return '\
<table>\
	<tr>\
		<td class="label"><label for="baNdit_imgURL">URL</label></td>\
		<td class="input"><input id="baNdit_imgURL" type="text"></input></td>\
	</tr>\
</table>';
}

function GetHTMLTagDialog() {
	var tagDialog = $("#baNdit_HTMLTagDialog");

	if(tagDialog.length > 0) return tagDialog;

	tagDialog = $("<div />")
		.attr("id", "baNdit_HTMLTagDialog")
		.html(GetHTMLTagDialogHTML())
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'Add a link to your comment',
			width: "60%",
			buttons: {
				"Cancel": function() { $(this).dialog("close"); },
				"OK": function() { 
					var commentBox = GetCommentBox();
					var selection = commentBox.getSelection();
					
					var linkTag = '<a href="{0}" target="_blank">{1}</a>'.format($("#baNdit_linkURL").val(), $("#baNdit_linkText").val());
					
					commentBox.replaceSelection(linkTag);
					commentBox.get(0).setSelectionRange(selection.start, linkTag.length + selection.start);					
					
					$(this).dialog("close"); 
				}
			},
			open: function() {
				var commentBox = GetCommentBox();
				var selection = commentBox.getSelection().text || "";

				$("#baNdit_linkText").val(selection);
				$("#baNdit_linkURL").val("").focus();
			},
		});

	return tagDialog;
}

function GetIMGTagDialog() {
	var tagDialog = $("#baNdit_IMGTagDialog");

	if(tagDialog.length > 0) return tagDialog;

	tagDialog = $("<div />")
		.attr("id", "baNdit_IMGTagDialog")
		.html(GetIMGTagDialogHTML())
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'Add an image to your comment',
			width: "60%",
			buttons: {
				"Cancel": function() { $(this).dialog("close"); },
				"OK": function() { 
					var commentBox = GetCommentBox();
					var selection = commentBox.getSelection();
					
					var imgTag = '<img src="{0}" border="0"/>'.format($("#baNdit_imgURL").val());
					
					commentBox.replaceSelection(imgTag);
					commentBox.get(0).setSelectionRange(selection.start, imgTag.length + selection.start);					
					
					$(this).dialog("close"); 
				}
			},
			open: function() {
				$("#baNdit_imgURL").val("").focus();
			},
		});

	return tagDialog;
}

function HTMLToolbar_AddLink() { 
	GetHTMLTagDialog().dialog("open");
}

function HTMLToolbar_AddImage() {
	GetIMGTagDialog().dialog("open");
}

function GetCommentBox() {
	return $("div#comment_form textarea#comment");
}

function AddHTMLToolbar() {
	var htmlEntities = 
	[
		{ entity : 'b', value : "Bold", image : chrome.extension.getURL("img/text_bold.png") },
		{ entity : 'i', value : "Italic", image : chrome.extension.getURL("img/text_italic.png") },
		{ entity : 'strike', value : "Strikethrough", image : chrome.extension.getURL("img/text_strikethrough.png") },
		{ entity : 'img', value : "Add an image", image : chrome.extension.getURL("img/image_add.png") },
		{ entity : 'a', value : "Add a link", image : chrome.extension.getURL("img/link_add.png") },
	];
	
	var commentBox = GetCommentBox();

	var htmlToolbar = $("<div />")
		.attr("id", "baNdit_HTML_toolbar");

	$.each(htmlEntities, function() {
		var htmlEntity = this;
		
		var button = $("<button />")
			.attr("id", "baNdit_{0}_button".format(htmlEntity.entity))
			.attr("type", "button")
			.attr("value", htmlEntity.entity)
			.attr("title", htmlEntity.value)
			.click(HandleToolbarClick)
			.append(
				$("<img />")
					.attr("src", htmlEntity.image)
			);

		htmlToolbar.append(button);
	});
	
	commentBox.before(htmlToolbar);
	
	var pasteBox = $("<input />").attr("type", "text").attr("id", "baNdit_paste").css("left", "-100%").css("position", "fixed");
	commentBox.before(pasteBox);
}

function TransformTextToPaste(textToPaste, selection) {
	if(IsImage(textToPaste) && selection.length <= 0) {
		return '<img src="{0}" border="0" />'.format(textToPaste);
	}
	
	if(IsURL(textToPaste)) {
		// TODO: Prompt if nothing selected. For now, just paste the URL
		var linkText = selection.length > 0 ? selection.text : textToPaste;
		
		return '<a href="{0}" target="_blank">{1}</a>'.format(textToPaste, linkText);
	}
	
	return textToPaste;
}

function SetupPasteHandler() {
	var fakePasteBoxName = "baNdit_paste";
	var commentBox = GetCommentBox();
	
	function afterPaste(originalBox, fakeBox) {
		var originalSelection = originalBox.getSelection();
		
		fakeBox.select();
		
		var textToPaste = fakeBox.getSelection().text;

		originalBox.focus();
		
		textToPaste = TransformTextToPaste(textToPaste, originalSelection);

		originalBox.replaceSelection(textToPaste);
		originalBox.get(0).setSelectionRange(originalSelection.start, textToPaste.length + originalSelection.start);
	};
		
	commentBox.live("paste", function(e) {
		var pasteBoxID = "#{0}".format(fakePasteBoxName);
		
		var pasteBox = $(pasteBoxID);
		
		if(!pasteBox) {
			pasteBox = $("<input />")
				.attr("type", "text")
				.attr("id", fakePasteBoxName)
				.css("left", "-100%")
				.css("position", "fixed")
				.insertBefore($(this));
		}
		
		pasteBox.focus();
		pasteBox.select();

		setTimeout(function(){ afterPaste($(e.target), pasteBox); }, 100);
	});
}

function baNdit_main() {
	PreProcessCommentsPage();
	
	InitializeUserNotes();
	InitializeUserColors();
	InitializePaidAttentionUsers();
	InitializeIgnoredUsers();
	MarkPostsAboveCoolScore();
	
	AddHTMLToolbar();
	
	SetupPasteHandler();
	
	CreateUserOptionsDialogs();
}

baNdit_main();