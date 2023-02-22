/*About this file«

This file was created as the place to keep all of the comments I kept on
tacking onto the top of the mods/sys/desk.js file, creating an overhead of
nearly 20kb. Even though this is not *really* a javascript file (in terms of
being "executable"), I want it to have a .js extension in order to allow for
highlighting of comment-specific labels like _TODO_ and _XXX_, as well as of
any code sketches that I want to start working on.

»*/

// ******************      mods/sys/desk.js     *****************

//Check out the TODO in the note below (Feb 8) about the desktop's FileSaver in save_dropped_files...

/*Feb 12, 2023«


"kid" objects are newly created:

1) Write_fs_file @DJTERNFGH
    a) saveFsByPath called by FileObj->sync (shell redirection)
    b) called by FileSaver->set_fent like:
        Write_fs_file(fEnt, new Blob([""]),fobj=>{...}, append=true);

2) mkdirkid @YEIMNJHFP (only called from populate_dirobj funcs)

3) move_kids @WKMFPOILV in the case of if_copy (all the properties are copied
    over from the 'srckid')

Looks like these are the only places where "file-like" (non-directories w/KIDS) nodes
are created.


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        XXX THE ISSUES OF MAINTAINABILITY ARE JUST LIKE THIS XXX

ANY TIME A NEW KID OBJ IS BEING CREATED (IE, NOT IN write_fs_file or mkdirkid),
AND IT IS NOT A DIRECTORY, IT MUST BE CALLED WITH add_lock_funcs!!!!!!!!!!!!


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



1) Copy a file somewhere.
2) Open it in TextEdit (it should be "write locked" now)
3) Open it in vim (it should not allow this)
4) Edit it in vim and save it (should never have been allowed)
5) Reload it in TextEdit (it shows the edits)

This is only a problem with files (copying directories words as expected).


The theory to "protect" against accidentally either:
1) writing over the contents of a file that is actively being edited
2) renaming or moving a file that is actively being edited


For all non root/top-level directories, we added a MOVE_LOCKS array to its tree node, and
we updated vim with the following functions:
const lock_file=()=>{//«
    edit_fobj.write_locked = true;
    let par = edit_fobj.par;
    while (par){
        if (par.is_root) break;
        par.MOVE_LOCKS.push(MOVE_LOCK);
        par = par.par;
    }
};//»
const unlock_file=()=>{//«
    delete edit_fobj.write_locked;
    let par = edit_fobj.par;
    while (par){
        if (par.is_root) break;
        par.rm_move_lock(MOVE_LOCK);
        par = par.par;
    }
};//»
...which are called upon starting and quitting.

Now that we have made the file nodes "static", with a fullpath property, doing a "mv" of
any parent directory invalidates all the fullpath's, so...

...at the bottom of fs.move_kids @WNHGDDJKUYH, we added the following: 
if (!if_copy){//«
	const doupdate=(kids)=>{
		for (let nm in kids){
			if (nm=="."||nm=="..") continue;
			let kid = kids[nm];
			kid.fullpath = get_path_of_object(kid);
			if (kid.KIDS) doupdate(kid.KIDS);
		}
	};
	if (newkid.KIDS) doupdate(newkid.KIDS);
}//»




»*/
/*Feb 11, 2023«

Where are kid objects created and added to their parent directories:
1) write_fs_file: both
2) mkdirkid: created, populate_fs_dirobj_by_path: added


The following is how I got rid of a very ad-hoc method for trying to ensure
file integrity:

//«
Commented out Desk.save_hook and Code.save_hook (was just called after
save_fs_by_path in fs->FileObj.sync, (and also strangely called after gzipping
in fs.lib!?))

Commented out Desk->check_open_files (called by Desk.save_hook after returning
from fs.get_file_len_and_hash_by_path and fs.save_fs_file after returning from
fs.write_fs_file.

Commented out fs.get_file_len_and_hash_by_path (called by Desk.save_hook).
//»

I want to replace this dumbhack with a "lock" on the node that is being written.



Wanted to get rid of the evidence that "_lnk" is the internal file extension of links, so
it should work just like "real" Linux/Unix!

»*/

/*Feb 10, 2023: Major refactoring of fs "this." functions and related callers«

Got rid of the ".rootonly" property in the directory structure, so 'if_root' is a meaningless
parameter to pass to path_to_obj.

We were previously disallowing moving/copying of LINK's. Now we got rid of that test
@HDLIUNCBWN in fs.js->com_mv.

»*/
/*Feb 9, 2023«

WRONG: Created termobj.popblank as a dumbhack to prepare the Terminal for doing "line by line"
werr's followed by wclerr's. Everything WOULD work except that in the first iteration
of werr+wclerr, the wclerr doesn't actually "clobber" the werr because of the way
that empty lines are perpetually added onto the Terminal's lines array upon the
start of the command, after a null byte ("\x00") is written out as a kind of "noop",
for the purpose of doing a linefeed.

RIGHT: Added this just under the variables in the response function.
if (if_clear && thisline && !thisline.length && lines.length){
	lines.pop();
	thisline = lines[lines.length-1];
} 


In libs/fs.js @SBGJTKILV (unzip): We have fs.mk_fs_dir, but we really want to
first ensure that we have permission to create folders in the cwd, and then
just make the folders with a fsapi.mkDir type function, which callss
mkdir_by_path, and then get_or_make_dir.


Want to get into looking for legacy this.some_snake_case_function, as well as
all the places that call them. It makes sense to do start changing all
"calling"/"client" code into await rather than doing the ES5 callback hell
thing.


Just commented out check_all_wins() in the window.onresize function in desk.js.
This function checks every window's size and location to make sure it is
completely contained in the desktop's viewport.  I want to start transitioning
from always having the devtools on the open to keeping it on the right, and
just using Ctrl+Shift+D to quickly toggle between devtools on the bottom and
back to the right. The thought of toggling between devtools open/close is not
very thinkable since it takes so long to open, and it focuses the cursor upon
opening it.

»*/
/*Feb 8, 2023:«

In fs.js @HYSKMFFDHJL, for doing, e.g. the very long recursive copying of folders in
the /mnt heirarchy, we created a kid node before starting the stream, and added
a 'filesaver_cb' that folders can call back. But it seems that the desktop's
FileSaver implementation in save_dropped_files has much less to it. TODO: I guess
that should be checked out.



Made it default to open a folder in the same window when the icon is not on the desktop.
Now, a new folder window can be forced when the control key is kept down, whether during
double-clicking, or with a Ctrl+Alt+Enter "force open" shortcut. Also, Ctrl+Enter was
added to allow for doing the normal "select enter" together with forcing the icon to
open with a new window.


In apps/sys/Folder.js @HDKMHHNDUH, we changed the init function to have an
'if_reinit' argument and to return a Promise, when called from the reload
function (by pressing the 'r' key). 'if_reinit' forces us to do another fs.populateDirObjByPath.
We did this because of the desire to see the new icons that were being copied
during a long copy process initiated from the command line, when doing, e.g. a 
copy of a folder full of videos from a subfolder of /mnt. However, doing this
gives us a full functioning icon (with no overdiv with updating percentages).
Perhaps putting some kind of "copy_in_progress" field on the file's FS node 
to allow the copying function to put an overdiv on it would be...



When doing minimize on a fullscreened window @RJKNWKOPVG (e.g. via a shortcut
key), we first unfullscreen it instantly before minimizing it. If the window
happens to not be the Desk.CWIN, we just give a console warning and otherwise
return silently.


In the fs.com_mv @HWNOMHDJK, we had to use the 'savename' variable rather than fent.NAME,
which allows us to do the proper recursive folder copying, when giving a 'topatharg' that 
doesn't exist. 

In other words, the path leading up to the final name exists, but the full path
doesn't, allowing us to change the name of the copied folder. Below, the copied folder's name is
not "thisfolder", but rather "butnotthename".

$ cp path/to/thisfolder the/destination/path/exists/butnotthename



In apps/sys/Terminal.js in handle_enter (@SHYRPLMUW), we changed the response from
response({"SUCC":["\x00"]}, {BREAK: true,NOEND:true});
to:
response({"SUCC":[""]}, {BREAK: true,NOEND:true});

For some reason, this allowed us to not have any blank lines when doing multiple
wclerr's during a recursive folder copy operation.


When opening a folder on the desktop that was newly created during a recursive
copy of a folder in /mnt filled with very large files, it doesn't seem to allow
us to see the files that are in the process of being written to, even though the
command line allows us to see the file actively being updated using the 'ls -fl' command.
Maybe remove dir.done?


Started out seeing about copying from the /mnt filesystem, both in terms of how the
progress is displayed and how well the recursive copying of directories works.

Made the progress indicator (which gives percents) include the filename at the
end, and needed to change the Terminal's respsucc and resperr functions to test
for the CLEAR flag, and if so, to not format/line wrap the output.


We changed the Filesaver workflow in fs.com_mv to be Promise-based, and made a poperr
in the desk's Filesaver worklow (which handles icon drops from the host OS) that instructs
the user to update it like in fs.com_mv.


Found out that icons were not created @SMIUBWKJH in fs.js, when doing recursive copying
from non-fs-type folders, so there we added:

if (Desk) Desk.make_icon_if_new(await pathToNode(newpath));


Then, we started looking into the ancient fs.mk_fs_dir, and saw that it was only called
from 3 locations: 
1) The 'mkdir' command in shell.js.
2) The 'unzip' command in libs/fs.js.
3) The Unzip application in apps/util/Unzip.js.

We found that none of these commands used the cur_dir or the winarg arguments, so the
signature was changed from:
	this.mk_fs_dir = (parpatharg, fname, cur_dir, cb, winarg, is_root)
to:
	this.mk_fs_dir = (parpatharg, fname, cb, is_root)

So we had to update the call to mk_fs_dir in the above 3 locations.


Desk.make_icon_if_new was changed from:
const make_icon_if_new = (path, appwinarg, fent) 
to:
const make_icon_if_new = fobj 

This command used to have a return value, but now it doesn't. vim.js used to test
for the return value and then call Desk.update_folder_statuses() if it returned true.
It appears that make_icon_if_new() effectively handles whatever update_folder_statuses()
is trying to accomplish, however.


XXX Bug (fixed) XXX

When doing recursive copying from, e.g. a /mnt/ subfolder, the files are given a
.APP of "File", so then we get the following error when double-clicking the icon:

GET http://localhost:8080/root/code/apps/File.js?v=4 404 (Not Found) core.js:1938          

This doesn't appear to be a problem when copying from a /www/ subfolder.

The problem was that Filesaver has an internal make_kid_obj function that created 
a 'kid' object with APP = "File". All we did was remove that, which seems to 
make everything work now.


We were testing doing recursive copying of /mnt folders from the command line, filled
with very long video files, and upon opening the newly created folder on the desktop,
there was a very weird issue with the overdiv spanning the entire width of the folder
(i.e., not being the same dimensions as the icon). This happened because fs.mv_desk_icon
was called from the writer_func of fs.com_mv, which called Desk.automake_icon, which
called add_icon_to_folder_win. Inside of that function, we set icon.pos = "relative",
which allowed the overdiv's absolute positioning to be relative to the overdiv.
It is possible that we might need to set this kind of relative positioning to
icons in folders that need overdivs but are not created in this way!


»*/
/*Feb 7, 2023: Desk.api.saveAs, appicons, links, and win.obj.onmodified«

XXX A HEADACHE HAPPENED IN HERE WHEN: We updated automake_icon to be async
because there is a check for the "app" extension, which needs to read from a
file in order to set an object's .appicon property (described below). This made
it return a Promise rather than an icon, which then screwed up the returned
values for fs.mv_desk_icon, which internally calls automake_icon. The only place
we use the returned icons was described down below.

There are ONLY 2 PLACES where automake_icon is called: 
	Desk.save_dropped_files->Desk.make_drop_icon
	fs.com_mv->fs.mv_desk_icon

Bottom line: icon.deref_appicon has been removed!



Implemented a desktop saveAs api function. In TextEdit, we have a reference
implementation for how to set the file's "Save As" extension by way of the context
menu.

A lot of work went into figuring out how to correctly display the icons of
newly saved ".app" files, whether through redirection of the 'mkappicon'
command into Whatever.app or through the TextEdit app with ".app" as the chosen
"Save As" extension. Much of this involved putting the ".appicon" property into
a file's child node object, which is always done in populate_fs_dirobj_by_path.
But since we are just adding the new nodes with newly saved files, we needed to
figure out where to put the ".appicon" property after saving the given file:
make_new_file, make_icon_if_new, and automake_icon.

Needed to update the save_dropped_files function largely because of the overhaul we've
given to make_icon.

Updated automake_icon to check the folder/desk element to see if there is
already an icon by that name. This was needed because fs.Mv_desk_icon calls
automake_icon after save_icon_editing calls fsapi.writeFile. When this is done
from a folder's (or the desk's) "New->Text File" context menu, we will get a
duplicate icon if we don't do this check.

Also, re-implemented the mechanism that checks to see if a Desktop window's
contents have been modified and then call the window object's "onmodified"
method.  In the TextEdit implementation of onmodified, a "yes/no" prompt is
displayed over the window to ask if the contents should be reloaded.

fs.mv_desk_icon was changed to return a Promise, resolving to an array of icons.
The only place the return values are used are in fs.com_mv when a copy operation
is being done from a "local" type file system (which can be of arbitrary size),
in order to do call Desk.add_drop_icon_overdiv, and set the cancel_func to the kill_cb.
So, the file may stopped being transferred through Ctrl-C in the Terminal or via
the context menu of the icon's overdiv.


LINKS TO APPICONS DID NOT WORK: 
GET http://localhost:8080/root/code/apps/Application.js?v=1 net::ERR_ABORTED 404 (Not Found) core.js:1937          

But then: We changed make_icon to test for app === "Application" in order to use "linkapp"
for the call to capi.getAppIcon, and then we changed open_icon_app to test for 
icon.app === "Application" to send it into the open_app() branch (rather than the open_file() branch).


»*/
/* Feb 6, 2023: Worked on getting a correct "Save As" from TextEdit«
There are 3 different js modules that must interact when Ctrl+s is typed into util.TextEdit
when there is just an "Untitled" document:

1) apps.util.TextEdit
2) apps.sys.Folder
3) mods.sys.desk.js

Whenever a new folder is navigated into (either forwards or backwards), it calls TextEdit's 
SAVE_FOLDER_CB function that is passed into Desk.open_file_by_path.

When 's' or 'Ctrl+s' is pressed during folder navigation, TextEdit's SAVE_CB is called in
the folder's keydown method, which instantly the desktop into CEDICN mode (the clickguard is
activated and the CEDICN's text area is always refocused upon clicking the clickguard).

If the escape key is pressed, the CEDICN is deleted and the clickguard is removed.
Otherwise, all key normal presses are directed into the CEDICN's text area, until the
enter key is pressed, which removes the clickguard.

If the folder window is closed, the SAVE_CB is called without any arguments, and the 
TextEdit application's state is reset to 'is_saving = false'.

»*/
/*Jan 31, 2023: icon->"Open with..."«
Just added the "Open with..." option for the icon's context menu.
The new workflow starts off @RMSKJUBPU, where the icon_dblclick's are called
with a fourth option (use_app), which is then fed into open_icon_app, then
open_file, and finally open_new_window, as opts.altApp. The final determination
is made @TIDMJUYTS.
»*/

/*Major system "house cleaning" on Jan. 9, 2023://«

Removed: SNESEmulator.js (4MB!) and SNESEmulator.mem from mods/games/ and put into SNES.zip
Removed: snes-wasm.js and walt.js from mods/util/wasm/ and put into WASM_UTIL.zip
Removed: esprima.js and escodegen.js from mods/util/es and put into ESPRIMA_UTIL.zip
Removed: mods/av/webm/ and put into WEBM_WASM.zip
Removed: mods/math/* (stats.js and trading.js)
Removed: mods/synth/ (Tone.js and dx7/)
Removed: 2 games from www/examples
Removed: many apps from apps/* and put into OLDAPPS.zip

Want to think about an "LOTW-ext" repo in order to keep the core project to a decent size...

»*/

/*July 2022: APPOBJ vs APPARGS«

We are making the distinction between an APPOBJ (which the app module gets called with, and contains
handles to Core, Main, and Top) and APPARGS (which is an object that gets called when the app is
launched in "appmode" (meaning that it is not being called as a file with an extension). In other
words, the app's this.onappinit method is called rather than the this.onloadfile method. The latter
method takes a Uint8Array as its argument, and we want the former method to take whatever is
valid JSON, i.e. retured from JSON.parse in the shell's 'app' command.

What we are doing now is finding everywhere in this file that there is an APPOBJ args, and replacing it
with APPARGS. The only issue with this is that there is an icon.path arg that did get passed along in 
APPOBJ. This path information is SUPPOSED to be used in make_app_window() in order to find the app's
somewhere within the browser's sandboxed file system, but since we've started to think about LOTW
in the purely node.js/localhost sense, and making no distinction between such things as "dev_mode" 
and "dev_env", we really are not using this information AT ALL.


THIS BREAKS THE ATTEMPT IN audio.Synth to pass the node to XSynth like this:

let win = await Desk.openApp("audio.XSynth", true, {WID:400,HGT:300}, {NODE: usenode});

openApp looks like:

	this.openApp = (appname, force_open, winargs, appobj).


»*/
//«

/*Idea for repositioning windows after the console window is reclosed«

Currently, windows are repositioned by check_all_wins() to fit in the available
area when the console is opened (or after any resize). But once it is reclosed,
the windows stay where they were, possibly ruining the layout that you wanted
to have.  I think I want to save the geometries (locations and sizes) of all
the windows, so that they can be put back where they were once it is reclosed
(you can tell when it is closed because (window.innerHeight === window.outerHeight &&
window.innerWidth === window.outerWidth)).

»*/
/*How to perfectly center stuff...«

position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);

»*/
/*!!! Error !!!//«

I had a deeply embedded folder icon that I moved onto the desktop, which had a window connected to it.
Window minimization status did not affect it.
Then I tried moving icons from that folder into another folder that was on the desktop. But there was an error that
said that the original (deeply embedded) directory path was not found. I guess the window path was 
not updated!?!?

Solution: @JEIOMPTY
If the window is a folder, I called reload with a path argument, which causes the sys.Folder app
to reset its internal 'path' variable and reinit the gui.

//»*/
//!!!!!!!!!!!!!     Commented out warning     !!!!!!!!!!!!!!«
//			cwarn("Make_icon():\x20have link,we have an extension too! " + arg.EXT);
/*!!!!!!!!!!!!!!!!!!!!    !IMPORTANTT   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Just like in: Automake_icon()... every time we make an icon to put directly 
into a folder window's icon_div, we need to set the parwin attribute to
the topwin!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
SOOOOOOOOOOOOOOOOOOOOO... what do we have to do to deref icons that are links?
ANYTHING DIFFERENT????????
»*/
/*!!!!!   Don't want to lose track of icons  !!!!//«
After creating icons via the popup/paste method, we saved them in the make_icon_cb 
(after place_in_icon_slot), but then icon editing was started, and we didn't save
under the real name. The bigger issue is that it just puts the icon anywhere, even
though there is not a location in localStorage.//»*/
/*Buggy buggy bug: select_icons_in_drag_box_desk //«

Created a text file (feebert.txt) in home dir and moved it to the desktop in shell.
Then "moved" if from feebert.txt to feebert to turn it into a bin file, but after
doing this, it became non selectable, and the icn wrapper at select_icons_in_drag_box_desk
was null (or perhaps the icon itself was null). After doing a reload_desk_icons_cb
with r_CAS, everything was AOK.

This is all about the perils of swapping out icon images.
//»*/
/*Issues«

For development purposes:
When loading the desktop with remote links on them (under /site), the server must have had
initfs and syncroot called, or there will be 500 server errors in server.py.

Also, when trying to move them around, there are checks for orig.root.TYPE=="local" to see
if they have to be copied.

In vim, when doing PGUP_ (UP_A) and PGDN_ (DOWN_A) while scrolling a long file, the
entire desktop scrolls up when the taskbar is hidden. Putting in the override
of those keysyms in dokeydown stops the behaviour. 
Working solution: desk.onscroll=e=>{desk.scrollTop=0;}

//!!!   ICONS array issues when moving onto folder icons  (SOLVED?)  !!!«


!!!!!     This all just seems to be about not having a correct ICONS array     !!!!!

So, all we gotta do is debug the ICONS array at the several points of moving icons
around.

Seems to be working with just doing icon_off && ICONS=[] when doing moves onto
folder icons.

Moving icons onto a folder's drop zone works the first time, but not the
second.  Once it gets working, remove the if(loc){...} thing from the beginning
of move_icons.

Okay, here's the deal. When icons are dropped onto a folder icon the first
time, the folder icon becomes selected with yellow. If the folder is then
opened by pressing ENTER_ or double clicking it, then it becomes deselected,
and the whole cycle of dropping icons onto it can begin again. If only gets
deselected with ESC_, then, that is when the problems start.


WHAT ONLY SEEMS TO ALWAYS WORK IS: PHYSICALLY DOUBLE CLICKING THE FOLDER ICON AFTER
DRAG'N'DROPPING STUFF ONTO IT.

ALSO: PHYSICALLY DOUBLE-CLICKING IT AFTER DOING CTRL-M ONTO IT.

Also: ENTER_ and ENTER_A are treated like ENTER_, when just 1 icon is highlighted yellow.

//»

»*/

//»



// ******************      mods/sys/fs.js     *****************

/*XXX FIXED ERROR @WONTYDJPO??? XXX«
Could not move links because mv_by_path calls get_fs_ent_by_path, which calls get_fs_by_path,
with ENT: true. But this calls path_to_obj, which will automatically deref a link UNLESS IT
IS INSTRUCTED NOT TO VIA THE 'GETLINK' flag passed in as an option..

»*/

/*If there is a desktop or shell already open, we can open in readonly mode, which means than the«
fs calls will fail:

SAVE_FS_FILE
    dir.getFile(fname, {create:true}
GET_FS_FILE (if if_make==true)
        dir.getDirectory(fname, arg
        dir.getFile(fname, arg

WRITE_FS_FILE
GET_OR_MAKE_DIR
    dir.getDirectory(name, {create:true}

RM_FS_FILE
MV_BY_PATH

»*/

//Recursive copying of remote folders @AIUTBNDHJEK



// ******************      app/sys/Terminal.js     *****************
//Issues«
/*@ODJTBQIKXH XXX IS IT CORRECT TO DO: 'if (y>=h) {' XXX??? «

Just added the math to include num_stat_lines inside of scroll_into_view().
Whenever we've had stat_lines before, we've never needed to call scroll_into_view(), because
it has always been in vim or less, where we had a completely different control flow of
how to handle keypresses and output.


Looking for a way, in normal shell mode, to subract n (1, maybe 2) lines from the bottom of
the screen to use it as a output area for instructions/status related to the given 
'getch_loop' mode that a command might be doing. How does vim/less do the status line thing
anyway?

OK: In this.getch_loop, we added an nstatlns arg (like in this.init_edit_mode), which lets us
use the bottom nstatlns of the screen as a quick and dirty status/app messaging area.
Now we have a this.stat_render, which lets us set the stat_lines array, then do a render.

In the render loop @PDJNUWLKH, we do a regex to negative lookahead with <'s, to see that
it is not a span tag (slosing or opening). So, all non-span-tag <'s get replaced with "&lt;".

Also, all &'s are being turned into &amp;'s.

»*/
//METACHAR_ESCAPE: This escapes the shell's metacharacters when autocompleting
/*

TYhdlT65: When typing Ctrl+d during app mode, we need to send an EOF, and let the current
command finish on its own terms!

*/
/*«

Step 1) Tidy up terminal, so that 'fs.' => '(await)? fsapi.'//«


FS444: get_dir_contents, if it is type==fs and it isn't "done"
FS666: get_dir_contents, if not above, but there are no kids and we are not remote or local (maybe /serv?) 
fs.Populate_dirobj => api.popDir //Given a node

FS555: get_dir_contents, and no kids with remote or local
fs.Populate_rem_dirobj => api.popDir

FS777: TAB gives one result that is a Folder
fs.Populate_dirobj_by_path => api.populateDirObjByPath

FS888: TAB gives one result that is a Link, then...
fs.Path_to_obj => api.pathToNode




//»

Step 2) Implement a minimal fs//«
pathToNode
popDir //Given a node
populateDirObjByPath
readFsFile
//»

Step 3) Implement a minimal shell//«

shell = new mods["sys.shell"](Core, termobj);

shell.execute(str, cur_dir, {init:if_init, root:root_state})
	returns Promise that resolves to return value (non-zero is error)

//Minimal echoing shell
this.execute = (runcom, dir_arg, opts={}) => {
	return new Promise((Y,N)=>{
		//response({SUCC:wrap_line(runcom).split("\n")});
		response({SUCC:fmt(runcom).split("\n")});
		Y(0);
	});
}

...then do a basic 'ls', etc.
//»

Step 4) Implement simple interfaces to vim, less, man, help, etc.


»*/
//Issues«

/*

Example of using 'wout' to print an error message with darkish red background
wout("Unknown size",{color:["","#a00"],error:1});

Doing encrypt, which might call read_stdin, thisline looks like [""]. How does this null
string get in lines? Also, what puts a single space in? 
//GHTYEKS
		else if (!if_force_nl && thisline.length == 1 && thisline[0]==" ") lines[lines.length-1] = outi.split("");
*/
///XXX BADBUG123 (Found 1/23/20 @7:30am)
//»
//»




//OLD«
/*

//This function has been highly refactored, and is being kept around to ensure that it is OK.
const save_icon_editing = async() => {//«
	const abort=async mess=>{
		if (!mess) mess="There was an error";
		CEDICN.del();
		if (CEDICN._editcb) {
			await WDGAPI.poperr(mess);
			CEDICN._editcb();
			CEDICN._editcb = null;;
		}
		else poperr(mess);
		CEDICN = null;
		CG.off();
	};
	const doend = async (oldnamearg, newvalarg) => {//«
		let oldname = getNameExt(oldnamearg)[0];
		let newval;
		if (newvalarg) {
			if (!CEDICN.link && CEDICN.app == FOLDER_APP) newval = newvalarg;
			else newval = getNameExt(newvalarg)[0];
		}
		if (newval) {
			update_all_paths(CEDICN.path + "/" + oldname, CEDICN.path + "/" + newval);
			CEDICN.name = newval;
			set_window_name_of_icon(CEDICN, newval);
		}
		else newval = oldname;
		CEDICN.label.innerText = newval;
		CEDICN.label.title = newval;
		CEDICN.dblclick = null;
		icon_off(CEDICN);
		CEDICN.name = newval;
		if (CEDICN._savetext||CEDICN._savetext==="") {
			let rv = await fsapi.writeFile(CEDICN.fullpath(), CEDICN._savetext);
			if (!rv) return abort("The file could not be created");
			CEDICN._entry = rv.entry;
			delete CEDICN._savetext;
		}

		if (CEDICN._editcb) {
			CEDICN._editcb(CEDICN);
			CEDICN._editcb = null;
		}
		CEDICN.save();
		if (CEDICN.parentNode===desk && !windows_showing) toggle_show_windows();
		CEDICN = null;
		CG.off();
	};//»
	let ifnew;
	if (CEDICN) {
		if (CEDICN.isnew) {
			ifnew = true;
			delete CEDICN.isnew;
			CEDICN.isnew = undefined;
		}
		let val = CEDICN.name;
		let holdname = val;
		let checkit = CEDICN.area.value.trim().replace(RE_SP_PL, " ").replace(RE_SP_G, "\u00A0");
		if (CEDICN.ext) {
			checkit += "." + CEDICN.ext;
			holdname += "." + CEDICN.ext;
		}
		if (ifnew || (checkit != CEDICN.fullname)) {
			let srcpath = CEDICN.path + "/" + holdname;
			let destpath = CEDICN.path + "/" + checkit;
			if (!await check_name_exists(checkit, CEDICN.parwin) || (ifnew && (srcpath == destpath))) {
				if (ifnew) {
					let parobj = await pathToNode(CEDICN.path);
					if (!parobj) {
						doend(holdname);
cerr("pathToNode(): parpath not found:" + CEDICN.path);
						return;
					}
					let rtype = parobj.root.TYPE;
					if (rtype == "fs") {
						if (CEDICN._savetext||CEDICN._savetext==="") doend(holdname, checkit);
						else {
							let mkret = await fsapi.mkFsDir(CEDICN.path, checkit, null, true);
							if (mkret) doend(holdname, checkit);
							else abort("Could not create the new directory");
						}
					}
					else {
						doend(holdname);
cerr("Unknown root type:" + rtype);
					}
				} 
				else {
					let app = (CEDICN.link&&"Link")||CEDICN.app;
//					fs.get_fs_ent_by_path(srcpath, async ret1 => {
					let ret1 = await fsapi.getFsEntryByPath(srcpath, {isDir: app===FOLDER_APP});
					if (ret1) {
						let ret2 = await fsapi.mvByPath(srcpath, destpath, {app: app});
						if (ret2) doend(holdname, checkit);
						else {
cerr("fs.mvByPath returned nothing");
							doend(holdname);
						}
					} else {
//						fs.get_fs_ent_by_path(destpath, ret3 => {
						let ret3 = await fsapi.getFsEntryByPath(destpath, {isDir: app===FOLDER_APP, create: true});
						if (ret3) doend(checkit);
						else {
cerr("fs.getFsEntryByPath returned nothing");
							doend(holdname);
						}
//						}, app, true);
					}
//					}, app);
				}
			} 
			else {
				popup(`The name "${checkit}" is already taken... reverting to "${holdname}"`);
				CEDICN.area.value = val;
				if (ifnew) CEDICN.isnew = true;
				save_icon_editing();
			}
		} else doend(holdname);
	}
}//»


*/

//»



