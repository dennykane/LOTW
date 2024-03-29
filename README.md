# FYI

This repository is no longer updated. 

The current version is now at https://github.com/linuxontheweb/linuxontheweb.github.io. 
You can try it out at https://linuxontheweb.github.io/.


# About *Linux on the Web* (LOTW)

## Screenshot

![Screenshot of LOTW desktop](https://github.com/linuxontheweb/os/blob/main/www/img/screenshot.png)


## Overview

### It's like Linux... on the web!

LOTW is all about porting the Linux/Unix/POSIX (\*nix) text-based command and
configuration ethos into the modern web platform. The desktop environment is
minimal: the only visible UI element (other than the desktop itself) is the
taskbar (where minimized windows go).  It is essential that all tasks can be
accomplished via the keyboard (e.g. resizing windows and moving icons around).


### Your files are stored locally

Everything else that calls itself a "browser-based operating
system" never seems to have much of an idea of *persistent client-side
state*. With LOTW, however, persistent client-side state is really the name
of the game. For example, performing the following simple operation in the
terminal application indeed creates an entry—containing all of the brilliance
you can muster—at `~/file.txt`, held in the browser's sandboxed local storage,
accessible regardless of network status:

`~$ echo "A bunch of interesting thoughts" > file.txt`

## Disclaimer (YMMV)

LOTW is developed in [the crouton environment](https://github.com/dnschneid/crouton),
which involves ChromeOS in developer mode.  All development and testing is currently done
on a Chromebook, using an up-to-date Chrome browser.

The system should basically work in any modern browser and host OS, but there are likely
many tiny glitches that degrade the user experience in other browsers and/or operating systems.

# Desktop usage

## Applications

There are several ways to open applications. The first two methods are used for
opening files and the last two are for opening applications in a new/untitled
state.

1) Double-clicking—or pressing the **Open icon under cursor** shortcut  (shortcuts are shown
below) with the icon cursor over—a file' s icon. If the file does not have an extension that is recognized by the system,
a default application will be invoked as the handler. The default application
is currently 'util.BinView' (code at 
[BinView.js](https://github.com/linuxontheweb/lotw/tree/main/root/code/apps/util/BinView.js)).

2) Using the command <code>$&nbsp;open path/to/somefile.ext</code> in the terminal. 

3) Creating an application icon via the terminal like this: 
<code>$&nbsp;mkappicon audio.Synth > ~/Desktop/MyAppIcon.app</code>, 
and then using either of the above methods to open the application.

4) Opening the application directly with the `app` command like such: <code>$&nbsp;app audio.Synth</code>. This method allows for tab
completion of the command's argument, making it a *very* simple way to search for available applications.


## Taskbar

The visibility of the taskbar at the bottom of the screen can be toggled by
invoking its context menu (right-clicking usually works) and selecting
**Hide/Show Taskbar** or via the keyboard shortcut, **Toggle taskbar
visibility**. The taskbar simply exists as a placeholder for minimized windows.
If the taskbar is visible, then the windows held by it are kept in the window
stack, and can therefore be accessed by the **Cycle window stack** keyboard
shortcut. If the taskbar is not visible, the windows held by it are considered
to be in a "background" state, i.e., they are no longer in the window stack,
and cannot be accessed via the graphical interface; to regain access to
minimized windows, the taskbar *must* be brought back into view.

## Icon cursor

The manipulation of icons is one of the main reasons why computer users are
forced to take their hands off of the keyboard.  To give power users another
option, the LOTW desktop features a cursor that allows for the toggling of
selection status, opening, and moving of icons. With the **Move selected icons
to cursor** shortcut, icons on the desktop can be moved to different desktop
locations, and also between the desktop and folders (changing their paths in
the LOTW file system).

## Keyboard shortcuts

### General
- **Open terminal**: Alt+t
- **Invoke context menu**: Alt+c
- **Toggle taskbar visibility**: Alt+b
- **Toggle icon cursor visibility**: / (forward slash)

### Windows
- **Maximize window**: Alt+m
- **Minimize window**: Alt+n
- **Close window**: Alt+x
- **Fullscreen window**: Alt+f
- **Move window**: Shift+[arrow]
- **Resize window**: Ctrl+Shift+[arrow]
- **Toggle layout mode**: Ctrl+Shift+l
- **Toggle window chrome**: Ctrl+Shift+w
- **Cycle window stack**: Alt+\`
- **Reload**: Alt+r (essential for developers)

### Icons
- **Toggle icon selection status under cursor**: Space
- **Continuously toggle icon selection status under cursor**: Ctrl+[arrow]
- **Select/open icon under the cursor**: Enter
- **Open icon under cursor**: Alt+Enter
- **Move selected icons to cursor**: Ctrl+m
- **Delete selected icons**: Ctrl+Backspace


# Command line usage

## LOTW uses a subset of the Shell Command Language

Other than high level control flow structures (like if..then and for..in), the syntax of
[the POSIX Shell Command Language](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html)
should mostly work. The reason why control flow idioms are not supported is because they add to
the complexity of the codebase (significant risks) without enough of a payoff in terms of added value (insignificant rewards).
Since the underlying JavaScript itself offers extremely effective algorithmic support,
those users who need to invoke their own non-supported, non-trivial functions via the command line will be
directed to the development side of LOTW.

## Searching for and invoking commands

The
[terminal](https://github.com/linuxontheweb/lotw/tree/main/root/code/apps/sys/Terminal.js)
application automatically loads the
[shell](https://github.com/linuxontheweb/lotw/tree/main/root/code/mods/sys/shell.js)
module upon invocation. Located inside the shell's source code are a number of builtin
commands (like `ls`, `cat`, `echo` and `pwd`).  You can see which these are by double
tapping the Tab key in the terminal with nothing at the prompt.  Since, however, 
there may be an arbitrary number of commands (1,000+) in a given LOTW installation,
an early design decision was to work out a concept of "command libraries", such that
the commands in a given library may be imported into the current shell's execution context;
so, to import all of the commands in the 'fs' command library, run: <code>$&nbsp;import fs</code>. 

Here is the way that you can see which commands are in a given library: <code>$&nbsp;lib &lt;libname&gt;</code>.
Also, since the `lib` command supports autocompletion for its argument, you can 
use it as a quick way to search for the available libraries in the LOTW system. 
Other than certain commands in certain libraries (like `vim` in 'fs'), though, 
many commands are fairly old/experimental and not likely to work in the current LOTW system.
If useful, they can be updated to work; if not, then simply deleted from the given library's source code.

## ~/.bashrc

Most Linux power users put their shell's runtime configuration file to great use. The 
standard one exists with the name '.bashrc' in the user's home directory (abbreviated as '~/').
Using this method, environment variables and command aliases can be created and arbitrary commands 
can be executed upon loading the terminal application. So, to automatically import the 'fs'
command library into you shell's execution context, you can run: <code>$&nbsp;echo 'import fs;' >> ~/.bashrc</code>.
Then the next time the terminal is loaded (you can use the **Reload** shortcut), the commands
in the 'fs' library will be automatically imported and available for use.


## Examples


Filter out whitespace-only lines in file.txt and send the output into `less`.

`$ cat file.txt | grep '^[^\s]+$' | less`

* * *

Attempt to create a new file from two files, then delete the originals. Print a message upon failure.

`$ cat file1.txt file2.txt > newfile.txt && rm file1.txt file2.txt || echo "The operation failed!"`


# Development

## Local setup

First, clone this repo!

Then, start the site server with [Node.js](https://nodejs.org/) (uses the default port, 8080):

`$ node basic_site.js`

Finally, in your browser, go to: http://localhost:8080


Or if you want to use another port (e.g. 12345), start it like so:

`$ LOTW_PORT=12345 node basic_site.js`

Then, go to: http://localhost:12345


## Project structure

[basic_site.js](https://github.com/linuxontheweb/lotw/tree/main/basic_site.js): The main Node.js service for sending core system files (in [root](https://github.com/linuxontheweb/lotw/tree/main/root)) to the client.

[docs](https://github.com/linuxontheweb/lotw/tree/main/docs): Folder where detailed instructions related to the usage of the system and the development and maintenance of the project are kept.

[root](https://github.com/linuxontheweb/lotw/tree/main/root): Folder where essential client-side files of the core system are kept.

[svcs](https://github.com/linuxontheweb/lotw/tree/main/svcs): Folder where any service that extends the system's core functionality (such as
sending and receiving email) are kept. Each service is to be run as an independent Node.js server
on an available port.

[www](https://github.com/linuxontheweb/lotw/tree/main/www): Folder where static assets to be used in the website (external to the LOTW system) and documentation are kept.

## Viewing and editing files

vim is the recommended text editor. The instructions below are specific to vim's runtime 
configuration file, .vimrc.

### Enabling row folding

Since the files in this repository can be quite large 
(the [desktop module](https://github.com/linuxontheweb/lotw/tree/main/root/code/mods/sys/desk.js)
contains over 7,000 lines at the time of this writing!), row folding is an
essential feature of the development side of LOTW. So, to browse the source code
as intended, the following lines must be included in your .vimrc:

	set foldmethod=marker
	set foldmarker=«,»
	set foldlevelstart=0

### Toggling folds
To quickly toggle between opened and closed row folds with the Enter key, add this line:

	nmap <enter> za

### Inserting fold markers
These are for easily inserting fold markers into the code file (from both normal and insert mode).

To insert an open fold marker, invoked with Alt+o, add these lines:

	execute "set <M-o>=\eo"
	nnoremap <M-o> a//«<esc>
	inoremap <M-o> //«

To insert a close fold marker, invoked with Alt+c, add these lines:

	execute "set <M-c>=\ec"
	nnoremap <M-c> a//»<esc>
	inoremap <M-c> //»

To insert both an open and close fold marker, with a space in between,
invoked with Alt+f, add these lines:

	execute "set <M-f>=\ef"
	nnoremap <M-f> a//«<enter><enter>//»<esc>
	inoremap <M-f> //«<enter><enter>//»


