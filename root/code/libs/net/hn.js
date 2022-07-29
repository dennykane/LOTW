
/*Firebase - Querying Data//«


With Firebase database queries, you can selectively retrieve data based on
various factors. To construct a query in your database, you start by specifying
how you want your data to be ordered using one of the ordering functions:
orderByChild(), orderByKey(), or orderByValue(). You can then combine these
with five other methods to conduct complex queries: limitToFirst(),
limitToLast(), startAt(), endAt(), and equalTo().

Since all of us at Firebase think dinosaurs are pretty cool, we'll use a
snippet from a sample database of dinosaur facts to demonstrate how you can
query data in your Firebase database.:

{
	"lambeosaurus": {
		"height" : 2.1,
		"length" : 12.5,
		"weight": 5000
	},
	"stegosaurus": {
		"height" : 4,
		"length" : 9,
		"weight" : 2500
	}
}

You can order data in three ways: by child key, by key, or by value. A basic
database query starts with one of these ordering functions, each of which are
explained below.

Ordering by a specified child key

You can order nodes by a common child key by passing that key to
orderByChild(). For example, to read all dinosaurs ordered by height, you can
do the following:

//Code«

Node.js

var db = firebaseAdmin.database();
var ref = db.ref("dinosaurs");
ref.orderByChild("height").on("child_added", function(snapshot) {
  console.log(snapshot.key + " was " + snapshot.val().height + " meters tall");
});


Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('height').get()
for key, val in snapshot.items():
    print('{0} was {1} meters tall'.format(key, val))

//»

Any node which does not have the child key we're querying on is sorted with a
value of null, meaning it will come first in the ordering. For details on how
data is ordered, see the How Data is Ordered section.

Queries can also be ordered by deeply nested children, rather than only
children one level down. This is useful if you have deeply nested data like
this:

{
	"lambeosaurus": {
		"dimensions": {
			"height" : 2.1,
			"length" : 12.5,
			"weight": 5000
		}
	},
	"stegosaurus": {
		"dimensions": {
			"height" : 4,
			"length" : 9,
			"weight" : 2500
		}
	}
}

To query the height now, you can use the full path to the object rather than a
single key:

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByChild("dimensions/height").on("child_added", function(snapshot) {
  console.log(snapshot.key + " was " + snapshot.val().height + " meters tall");
});

Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('dimensions/height').get()
for key, val in snapshot.items():
    print('{0} was {1} meters tall'.format(key, val))

//»

Queries can only order by one key at a time. Calling orderByChild() multiple
times on the same query throws an error.


****************************************

Using Indexes For Improved Performance

If you want to use orderByChild() on a production app, you should define the
keys you are indexing on via the .indexOn rule in your Security and Firebase
Rules. While you are allowed to create these queries ad-hoc on the client, you
will see greatly improved performance when using .indexOn. Read the
documentation on the .indexOn rule for more information.

****************************************


Ordering by key

You can also order nodes by their keys using the orderByKey() method. The
following example reads all dinosaurs in alphabetical order:

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByKey().on("child_added", function(snapshot) {
  console.log(snapshot.key);
});

Python

ref = db.reference('dinosaurs')
snapshot = ref.order_by_key().get()
print(snapshot)

//»

Ordering by value

You can order nodes by the value of their child keys using the orderByValue()
method. Let's say the dinosaurs are having a dino sports competition and you're
keeping track of their scores in the following format:

{
	"scores": {
		"bruhathkayosaurus" : 55,
		"lambeosaurus" : 21,
		"linhenykus" : 80,
		"pterodactyl" : 93,
		"stegosaurus" : 5,
		"triceratops" : 22
	}
}


To sort the dinosaurs by their score, you could construct the following query:

//Code«

Node.js
var scoresRef = db.ref("scores");
scoresRef.orderByValue().on("value", function(snapshot) {
  snapshot.forEach(function(data) {
    console.log("The " + data.key + " dinosaur's score is " + data.val());
  });
});

Python
ref = db.reference('scores')
snapshot = ref.order_by_value().get()
for key, val in snapshot.items():
    print('The {0} dinosaur\'s score is {1}'.format(key, val))

//»

See the How Data is Ordered section for an explanation on how null, boolean,
string, and object values are sorted when using orderByValue().

Indexing on Values for Improved Performance

If you want to use orderByValue() in a production app, you should add .value to
your rules at the appropriate index. Read the documentation on the .indexOn
rule for more information.

Complex Queries

Now that it is clear how your data is ordered, you can use the limit or range
methods described below to construct more complex queries.

Limit Queries

The limitToFirst() and limitToLast() queries are used to set a maximum number
of children to be synced for a given callback. If you set a limit of 100, you
will initially only receive up to 100 child_added events. If you have fewer
than 100 messages stored in your database, a child_added event will fire for
each message. However, if you have over 100 messages, you will only receive a
child_added event for 100 of those messages. These are the first 100 ordered
messages if you are using limitToFirst() or the last 100 ordered messages if
you are using limitToLast(). As items change, you will receive child_added
events for items that enter the query and child_removed events for items that
leave it, so that the total number stays at 100.

Using the dinosaur facts database and orderByChild(), you can find the two heaviest dinosaurs:

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByChild("weight").limitToLast(2).on("child_added", function(snapshot) {
  console.log(snapshot.key);
});

Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('weight').limit_to_last(2).get()
for key in snapshot:
    print(key)

//»

The child_added callback is triggered exactly two times, unless there are less
than two dinosaurs stored in the database. It will also get fired for every
new, heavier dinosaur that gets added to the database. In Python, the query
directly returns an OrderedDict containing the two heaviest dinosaurs.

Similarly, you can find the two shortest dinosaurs by using limitToFirst():

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByChild("height").limitToFirst(2).on("child_added", function(snapshot) {
  console.log(snapshot.key);
});
Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('height').limit_to_first(2).get()
for key in snapshot:
    print(key)

//»

The child_added callback is triggered exactly two times, unless there are less
than two dinosaurs stored in the database. It will also get fired again if one
of the first two dinosaurs is removed from the database, as a new dinosaur will
now be the second shortest. In Python, the query directly returns an
OrderedDict containing the shortest dinosaurs.

You can also conduct limit queries with orderByValue(). If you want to create a
leaderboard with the top 3 highest scoring dino sports dinosaurs, you could do
the following:

//Code«

Node.js
var scoresRef = db.ref("scores");
scoresRef.orderByValue().limitToLast(3).on("value", function(snapshot) {
  snapshot.forEach(function(data) {
    console.log("The " + data.key + " dinosaur's score is " + data.val());
  });
});
Python
scores_ref = db.reference('scores')
snapshot = scores_ref.order_by_value().limit_to_last(3).get()
for key, val in snapshot.items():
    print('The {0} dinosaur\'s score is {1}'.format(key, val))

//»

Range Queries

Using startAt(), endAt(), and equalTo() allows you to choose arbitrary starting
and ending points for your queries. For example, if you wanted to find all
dinosaurs that are at least three meters tall, you can combine orderByChild()
and startAt():

//Code«

Node.js
  var ref = db.ref("dinosaurs");
  ref.orderByChild("height").startAt(3).on("child_added", function(snapshot) {
    console.log(snapshot.key);
  });
Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('height').start_at(3).get()
for key in snapshot:
    print(key)

//»

You can use endAt() to find all dinosaurs whose names come before Pterodactyl
lexicographically:

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByKey().endAt("pterodactyl").on("child_added", function(snapshot) {
  console.log(snapshot.key);
});
Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_key().end_at('pterodactyl').get()
for key in snapshot:
    print(key)

//»

startAt() and endAt() are inclusive, meaning "pterodactyl" will match the query above.

You can combine startAt() and endAt() to limit both ends of your query. The
following example finds all dinosaurs whose name starts with the letter "b":

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByKey().startAt("b").endAt("b\uf8ff").on("child_added", function(snapshot) {
  console.log(snapshot.key);
});

Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_key().start_at('b').end_at(u'b\uf8ff').get()
for key in snapshot:
    print(key)

//»

The \uf8ff character used in the query above is a very high code point in the
Unicode range. Because it is after most regular characters in Unicode, the
query matches all values that start with a b.

The equalTo() method allows you to filter based on exact matches. As is the
case with the other range queries, it will fire for each matching child node.
For example, you can use the following query to find all dinosaurs which are 25
meters tall:

//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.orderByChild("height").equalTo(25).on("child_added", function(snapshot) {
  console.log(snapshot.key);
});
Python
ref = db.reference('dinosaurs')
snapshot = ref.order_by_child('height').equal_to(25).get()
for key in snapshot:
    print(key)

//»

Range queries are also useful when you need to paginate your data.

You can also combine orderByValue() with startAt() and endAt() to construct range queries.

Putting it all together

You can combine all of these techniques to create complex queries. For example,
you can find the name of the dinosaur that is just shorter than Stegosaurus:


//Code«

Node.js
var ref = db.ref("dinosaurs");
ref.child("stegosaurus").child("height").on("value", function(stegosaurusHeightSnapshot) {
  var favoriteDinoHeight = stegosaurusHeightSnapshot.val();

  var queryRef = ref.orderByChild("height").endAt(favoriteDinoHeight).limitToLast(2)
  queryRef.on("value", function(querySnapshot) {
    if (querySnapshot.numChildren() === 2) {
      // Data is ordered by increasing height, so we want the first entry
      querySnapshot.forEach(function(dinoSnapshot) {
        console.log("The dinosaur just shorter than the stegasaurus is " + dinoSnapshot.key);

        // Returning true means that we will only loop through the forEach() one time
        return true;
      });
    } else {
      console.log("The stegosaurus is the shortest dino");
    }
  });
});


Python
ref = db.reference('dinosaurs')
favotire_dino_height = ref.child('stegosaurus').child('height').get()
query = ref.order_by_child('height').end_at(favotire_dino_height).limit_to_last(2)
snapshot = query.get()
if len(snapshot) == 2:
    # Data is ordered by increasing height, so we want the first entry.
    # Second entry is stegosarus.
    for key in snapshot:
        print('The dinosaur just shorter than the stegosaurus is {0}'.format(key))
        return
else:
    print('The stegosaurus is the shortest dino')

//»

How Data is Ordered

This section explains how your data is ordered when using each of the four
ordering functions.

orderByChild

When using orderByChild(), data that contains the specified child key is
ordered as follows:

Children with a null value for the specified child key come first.

Children with a value of false for the specified child key come next. If
multiple children have a value of false, they are sorted lexicographically by
key.

Children with a value of true for the specified child key come next. If
multiple children have a value of true, they are sorted lexicographically by
key.

Children with a numeric value come next, sorted in ascending order. If multiple
children have the same numerical value for the specified child node, they are
sorted by key.

Strings come after numbers, and are sorted lexicographically in ascending
order. If multiple children have the same value for the specified child node,
they are ordered lexicographically by key.

Objects come last, and sorted lexicographically by key in ascending order.

orderByKey

When using orderByKey() to sort your data, data is returned in ascending order
by key as follows. Keep in mind that keys can only be strings.

Children with a key that can be parsed as a 32-bit integer come first, sorted
in ascending order.

Children with a string value as their key come next, sorted lexicographically
in ascending order.

orderByValue

When using orderByValue(), children are ordered by their value. The ordering
criteria is the same as in orderByChild(), except the value of the node is used
instead of the value of a specified child key.


//»*/

//HackerNews API«

/*Item//«

//let rv = await fetch('https://hacker-news.firebaseio.com/v0/item/8863.json?print=pretty');

id				The item's unique id.
BIGINT

type			The type of item. One of "story", "comment", "job", "poll", or "pollopt".
CHAR(10)

title			The title of the story, poll or job. HTML.
CHAR(80)

by				The username of the item's author.
CHAR(20)

time			Creation date of the item, in Unix Time.
BIGINT

text			The comment, story or poll text or story URL
TEXT

kids			The ids of the item's comments, in ranked display order.
TEXT (JSON int array)

parent			The comment's parent: either another comment or the relevant story.
BIGINT

descendants		In the case of stories or polls, the total comment count.
INT

score			The story's score, or the votes for a pollopt.

deleted			true if the item is deleted.
dead			true if the item is dead.

poll			The pollopt's associated poll.
parts			A list of related pollopts, in display order.


  "by" : "dhouston",
  "descendants" : 71,
  "id" : 8863,
  "kids" : [ 9224, 8917, 8952, 8884, 8887, 8869, 8958, 8940, 8908, 9005, 8873, 9671, 9067, 9055, 8865, 8881, 8872, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8870, 8878, 8980, 8934, 8943, 8876 ],
  "score" : 104,
  "time" : 1175714200,
  "title" : "My YC app: Dropbox - Throw away your USB drive",
  "type" : "story",
  "url" : "http://www.getdropbox.com/u/2/screencast.html"


»*/

/*User//«

//let rv = await fetch('https://hacker-news.firebaseio.com/v0/user/lotwxyz.json?print=pretty');
id			The user's unique username. Case-sensitive. Required.
BIGINT

delay		Delay in minutes between a comment's creation and its visibility to other users.

INT
created		Creation date of the user, in Unix Time.

karma		The user's karma.
BIGINT

about		The user's optional self-description. HTML.
VARCHAR(100)

submitted	List of the user's stories, polls and comments.

//»*/

//Stories//«
//topstories == default feed (500)
//beststories = most upvotes (200)
//Also: newstories, askstories, showstories, jobstories
//»

//updates = item and profiles changes
//maxitem = current largest item ID


/*
let rv = await fetch('https://hacker-news.firebaseio.com/v0/beststories.json?print=pretty');
let txt = await rv.text();
if (rv.ok!==true) cberr(txt);
let obj = JSON.parse(txt);
log(obj);
cbok(txt);
*/

//»

/*WebSQL«

Select query

SELECT column1, column2....columnN
	FROM table_name
	WHERE CONDITION-1 {AND|OR} CONDITION-2
	ORDER BY column_name {ASC|DESC};

//Logical ops: >, <, =, LIKE, NOT
sqlite> SELECT * FROM COMPANY WHERE SALARY = 10000;
sqlite> SELECT * FROM COMPANY WHERE AGE >= 25 AND SALARY >= 65000;
sqlite> SELECT * FROM COMPANY WHERE AGE >= 25 OR SALARY >= 65000;
sqlite>  SELECT * FROM COMPANY WHERE AGE IS NOT NULL;
sqlite> SELECT * FROM COMPANY WHERE NAME LIKE 'Ki%';
sqlite> SELECT * FROM COMPANY WHERE NAME GLOB 'Ki*';
sqlite> SELECT * FROM COMPANY WHERE AGE IN ( 25, 27 );
sqlite> SELECT * FROM COMPANY WHERE AGE NOT IN ( 25, 27 );
sqlite> SELECT * FROM COMPANY WHERE AGE BETWEEN 25 AND 27;

//Using a subquery
sqlite> SELECT AGE FROM COMPANY 
   WHERE EXISTS (SELECT AGE FROM COMPANY WHERE SALARY > 65000);
sqlite> SELECT * FROM COMPANY 
   WHERE AGE > (SELECT AGE FROM COMPANY WHERE SALARY > 65000);

//	WHERE column_name BETWEEN val-1 AND val-2;//???


SELECT COUNT(column_name)
	FROM table_name
	WHERE CONDITION;


»*/

export const lib = (comarg, args, Core, Shell)=>{

const COMS={//«


hndatedays:async()=>{//«

let obj = await get_date_obj(args.shift());
if (!obj) return;

let from = args.shift();
if (!from) return cberr("No from date arg!");
if (!from.match(/^\d\d?-\d{4}$/)) return cberr("Invalid format to 'from date'");

let fromid = (obj[from]);
if (!fromid) return cberr("No from id found!");

let to = args.shift();
if (!to) return cberr("No to date arg!");
if (!to.match(/^\d\d?-\d{4}$/)) return cberr("Invalid format to 'to date'");

let toid = (obj[to]);
if (!toid) return cberr("No to id found!");

if (fromid >= toid) return cberr("From id must be less");

let skip = Math.floor((toid - fromid)/50);

let from_mon = from.split("-")[0].pi()-1;
let from_yr = from.split("-")[1].pi();

let to_mon = to.split("-")[0].pi()-1;
let to_yr = to.split("-")[1].pi();

let totime = new Date(to_yr, to_mon).getTime()/1000;
let curday=2;
let iter=0;
//log(`00: 1-${from_mon+1}-${from_yr}: ${fromid}`);
cwarn(`${from} -> ${to}`);
log(`00: 1-${from_mon+1}-${from_yr}: ${fromid}`);
wout(`1-${from_mon+1}-${from_yr}: ${fromid}`);
let curid = fromid+skip;
let killed = false;
kill_register(cb=>{
	killed=true;
	cb&&cb();
});

OUTER: while (!killed){
iter++;

if (iter >= 10000) {
	cerr("Infinity");
	break;
}
let time = new Date(from_yr, from_mon, curday).getTime()/1000;
if (time >= totime) break;

let gottime = await gettime(curid);
if (!gottime) {
	curid++;
	gottime = await gettime(curid);
	if (!gottime) return cberr("111 ???");
}
//if (!gottime) return cberr("???");
let iter2 = 0;

let lastid = curid;
let curskip = skip;
while(!killed){
iter2++;
if (iter2>= 10000) {
	cerr("Infinity");
	break OUTER;
}

	let dt = time - gottime;
//log("DIFF", dt);
werr(`dt:${dt}\xa0\xa0Skip:${curskip}`);
	if (dt < 0){
		if (dt > -600){
log(`1b: ${curday}-${from_mon+1}-${from_yr}: ${curid}`);
wout(`${curday}-${from_mon+1}-${from_yr}: ${curid}`);
			break;
		}
		if (curskip <= 1){
//cwarn("Found day2");
//log(curid, gottime);
cwarn(`2: ${curday}-${from_mon+1}-${from_yr}: ${curid}`);
wout(`${curday}-${from_mon+1}-${from_yr}: ${curid}`);
			break;
		}
		curskip = Math.floor(curskip/2);
		curid = lastid + curskip;
	}
	else if (dt < 600){
//log("Found day1");
log(`1a: ${curday}-${from_mon+1}-${from_yr}: ${curid}`);
wout(`${curday}-${from_mon+1}-${from_yr}: ${curid}`);

		break;
	}
	else{
		lastid=curid;
		curid+=curskip;
	}
	while(!(gottime = await gettime(curid))) curid++;
	

}

curday++;
}
//log(totime);


cbok();

},//»

hnparsedat:async()=>{//«

let yr = args.shift();
if (!yr) return cberr("No year");
yr = yr.ppi();
if (!NUM(yr)) return cberr("Bad year arg");
if (yr < 2006 || yr > 2020) return cberr(`Year out of range (2006-2020)`);
let mon = args.shift();
if (!mon) return cberr("No month");
mon = mon.ppi();
if (!NUM(mon)) return cberr("Bad month arg");
if (mon < 1 || mon > 12) return cberr("Month out of range (1-12)");
let d = new Date(yr, mon-1);
let secs = Math.floor(d.getTime()/1000);


let fname = args.shift();
if (!fname) return cberr("No filename!");
let fobj = await pathToNode(fname);
if (!fobj) return cberr(`${fname}:\x20file not found`);
if (fobj.APP=="Folder") return cberr(`${fname}:\x20is a directory`);
if (fobj.root.TYPE!="fs") return cberr(`not handling fs type '${fobj.root.TYPE}'`);
let path = fobj.fullpath;
if (!path) return cberr("No fullpath property found!??!??!");
if (!fs.check_fs_dir_perm(fobj.par)) return cberr(`${fname}:\x20write permission denied`);
let dat = await readFile(fname,{BINARY:true});
if (dat.length%8) return cberr("Invalid file data");
let arr = new Uint32Array(dat.buffer);
let out = [];
let len = arr.length;
let dn=Infinity,dp=Infinity;
let idn, idp;
let tmn, tmp;
let ideq;
for (let i=0; i < len; i+=2) {
	let id = arr[i];
	let time = arr[i+1];
	if (time===secs){
		ideq = id;
		break;
	}
	let d = secs - time;
	if (d < 0 && -d < dp){
		idp = id;
		dp = -d;
		tmp = time;
	}
	else if (d > 0 && d < dn){
		idn = id;
		dn = d;
		tmn = time;
	}
}
if (ideq){
	wout(`Exact ${ideq}`);
}
else{
	werr((dp/86400).toFixed(2));
	wout(`${mon}-${yr} ${idp}`);
//	werr(`ID: ${idp}  Time: ${tmp}  Diff: +${}`);
//	wout(""+idp);
}

cbok();

},//»

hnwalkback:async()=>{//«

let iter=0;
let curid;

const save=()=>{//«

return new Promise(async(y,n)=>{
	let arr=[];
	let len = out.length;
	for (let i=0; i < len; i++){
		let n = out[i];
		if (Number.isFinite(n)) arr.push(i, n);
	}
	if (!await fsapi.writeFile(path, new Blob([(new Uint32Array(arr)).buffer]))){
		cerr("Could not save the file to: ",path);
	}
	y(true);
});

};//»
const start=async id=>{//«
	werr(`Starting from: ${id}`);
	while (!killed && id > 0){
		curid = id;
		if (if_verb) werr(`Getting item: ${id}`);
		let val = await gettime(id);
		if (!val) {
//			await save();
			werr(`Could not get time for: ${id}`);
			id-=skip;
			iter++;
//			return;
			continue;
		}
		if (if_verb) werr(`${iter}) ${id} -> ${new Date(1000*val).toUTCString()}`);
		out[id]=val;
		if (val <= floor){
			werr(`Floor value reached!`);
			await save();
			cbok();
			return;
		}
		id-=skip;
		iter++;
	}
};//»

let _;
let skip = 1000;
let floor = 0;
let opts = failopts(args,{l:{skip:3,verbose:1,floor:3},s:{s:3,v:1,f:3}});
if (!opts) return;
let if_verb = opts.verbose||opts.v;
_=opts.skip||opts.s;
if (_){
	skip = _.ppi();
	if (!NUM(skip)) return help();
}
_=opts.floor||opts.f;
if (_){
	if (_.match(/^\d+$/)) {
		floor = _.ppi();
		if (!NUM(floor)) return help();
	}
	else{
		let arr = _.regstr().split(" ");;
		let yr = arr.shift().ppi();
		let mon=1;
		let day=1;
		if (!NUM(yr)) return cberr("Bad year");
		if (yr < 2006 || yr > 2020) return cberr(`Year out of range (2006 -> 2020)`);
		_ = arr.shift();
		if (_){
			mon = _.ppi();
			if (!NUM(mon)) return cberr("Bad month");
			if (mon < 1 || mon > 12) return cberr(`Month out of range (1 -> 12)`);
			_ = arr.shift();
			if (_){
				day = _.ppi();
				if (!NUM(day)) return cberr("Bad day");
				if (day < 1 || day > 31) return cberr(`Day out of range (1 -> 31)`);
				if (arr.length) return cberr("Unexpected fields in the 'floor' arg");
			}
		}
		floor = new Date(yr,mon-1,day).getTime()/1000;
	}
}
//cbok();
//return;

let fname = args.shift();
if (!fname) return help();
let fobj = await pathToNode(fname);
if (!fobj) return cberr(`${fname}:\x20file not found`);
if (fobj.APP=="Folder") return cberr(`${fname}:\x20is a directory`);
if (fobj.root.TYPE!="fs") return cberr(`not handling fs type '${fobj.root.TYPE}'`);
let path = fobj.fullpath;
if (!path) return cberr("No fullpath property found!??!??!");
if (!fs.check_fs_dir_perm(fobj.par)) return cberr(`${fname}:\x20write permission denied`);
let dat = await readFile(fname,{BINARY:true});
if (dat.length%8) return cberr("Invalid file data");

_ = args.shift();
let fromid;
if (_){
	fromid = _.ppi();
	if (!NUM(fromid)) return cberr(`Invalid 'fromid': ${_}`);
}

let arr = new Uint32Array(dat.buffer);
let out = [];
let len = arr.length;

if (len) {
	let minid = Infinity;
	for (let i=0; i < len; i+=2) {
		let id = arr[i];
		if (id < minid) minid = id;
		out[id] = arr[i+1];
	}
	if (!fromid) {
cwarn("Found min in file: ",minid);
		fromid = minid - skip;
	}
}

if (if_verb) {
	werr(`Writing output to file: ${path}`);
	werr(`Skip factor: ${skip}`);
	werr(`Floor value: ${floor}`);
}

ERRMESS="";

let ref = get_ref("/v0/maxitem");
if (!ref) return cberr(ERRMESS||"Reference error");

let killed = false;
kill_register(async cb=>{
	killed=true;
cwarn(`Killed! Last id: ${curid}`);
werr(`Killed! Last id: ${curid}`);
//werr(`Last id: ${curid}`);

	await save();
	cb&&cb();
});
if (fromid) return start(fromid);
ref.once('value',snap=>{
	let num = snap.val();
	if (!NUM(num)&&num>0) return cberr(`invalid maximum valid returned`);
	start(num);
});


},//»

hnsql:async()=>{//«

let opts = failopts(args,{l:{type:3},s:{t:3}});
if (!opts) return;
if (!args.length) return help();
let rv = await dbtrans(args.join(" "));
if (!rv) return cberr(ERRMESS||"Error");
if (!rv.rows.length) return cberr("No results");
let row0 = rv.rows[0];
if (isstr(row0)){
	for (let row of rv.rows) wout(row);
}
else if (isobj(row0)){
	for (let row of rv.rows) woutobj(row);
}
else woutarr(Array.from(rv.rows));

cbok();

},//»

hnpipe:()=>{//«

let opts = failopts(args,{l:{html:1,text:1},s:{h:1,t:1}});
if (!opts) return;
let if_render = opts.html||opts.h||opts.text||opts.t;
if (!get_reader().is_pipe) return help();
kill_register(cb=>{
	cb&&cb();
});

read_stdin(obj=>{

if (!obj) return;
if (!(isobj(obj))){
	werr(`Ignoring type: '${typeof obj}'`);
	return;
}
if (obj.EOF===true){
	cbok();
	return;
}
if (obj.CLEAR===true) {
	woutobj(obj);
	return;
}
if (obj.TIME===true){
	woutobj(obj);
	return;
}
let cname = obj.constructor.name;
if (!HN_OBJ_TYPES.includes(cname)){
	werr(`Ignoring object type: '${cname}'`);
	return;
}
if (if_render){
	wout(render(cname, obj, opts));
}
else {
	woutobj(obj);
}

});


},//»
hnitem:async()=>{//«

	let opts = failopts(args,{l:{delete:1,verbose:1},s:{d:1,v:1}});
	if (!opts) return;
	let id = args.shift();
	let ifdel = opts.delete||opts.d;
	let itemnum = id.ppi();
	if (!NUM(itemnum)) return help();
	let ret;
	if (ifdel){
		ret = await dbtrans(`DELETE FROM item WHERE id = ${id}`);
		if (!ret.rowsAffected) return cberr(`No such item:\x20${id}`);
		cbok();
		return;
	}
	ERRMESS="";
	let item = await get_item(id,opts.verbose||opts.v);
	if (!item) return cberr(ERRMESS||"Error");
	woutobj(item);
	cbok();

},//»

hnitemkids:async()=>{//«
	const referr=()=>{
		cberr(ERRMESS||"Reference error");
	};
	let opts = failopts(args,{l:{verbose:1, descendants:1},s:{v:1,d:1}});
	if (!opts) return;
	let if_desc = opts.descendants||opts.d;
	let if_verb = opts.verbose||opts.v;
	let id = args.shift();
	if (!id||args.length) return help();
	let itemnum = id.ppi();
	if (!NUM(itemnum)) return help();
	let ret;
	ERRMESS="";
	let idref = get_ref(`/v0/item/${id}/type`);
	if (!idref) return referr();

	idref.once('value',snap=>{

	let type = snap.val();
	if (!type) return cberr(`${id}: not found`);
	let which;
	if (if_desc){
		if (type!="story") return cberr(`'descendants' flag requires item type == 'story' (got '${type}')`);
		which="descendants";
	}
	else which="kids";
//If type==story, we can listen to descendants for total comment count, instead of kids.

	if (if_verb) werr("Item type: "+type);

	ERRMESS="";
	let kidsref = get_ref(`/v0/item/${id}/${which}`);
	if (!kidsref) return referr();
	kill_register(cb=>{
		if (kidsref) kidsref.off();
		cb&&cb();
	});
	kidsref.on('value',snap=>{
		let val = snap.val();
		if (val===null) {
			if (if_verb) werr(`0 ${which} found`);
			return;
		}
		if (if_desc){
//			werr();
log("VAL",val);
			wout(val);
			return;
		}
		if (isarr(val)) {
			if (if_verb) werr(`${val.length} kids found`);
			return woutarr(val);
		}
cerr("What is this kids???");
log(val);
	});

	});

},//»

hntop:()=>{get_stories("top");},
hnbest:()=>{get_stories("best");},
hnshow:()=>{get_stories("show");},
hnnew:()=>{get_stories("new");},
hnask:()=>{get_stories("ask");},
hnjob:()=>{get_stories("job");},

hnmktab:async()=>{//«
	let opts = failopts(args,{l:{all:1},s:{a:1}});
	if (!opts) return;
	let which = args.shift();
	if (opts.a||opts.all){
		if (which) return help();
		let keys = Object.keys(TABLE_DEFS);
		let goterr=false;
		for (let k of keys){
			werr(`Making table: ${k}`);
			if (!await dbtrans(`CREATE TABLE IF NOT EXISTS ${k} (${TABLE_DEFS[k]})`)) {
				werr(`Failed to make table '${which}'`);
				goterr=true;
			}
			else werr("OK");
		}
		if (goterr) cberr();
		else cbok();
		return;
	}
	if(!which||args.length) return help();
	let def = TABLE_DEFS[which];
	if (!def) return help();
	let rv = await dbtrans(`CREATE TABLE IF NOT EXISTS ${which} (${def})`);
	if (!rv) return cberr(`Failed to make table '${which}'`);
	cbok();

},//»
hndesctab:async()=>{//«
	let which = args.shift();
	if(!which||args.length) return help();
	let def = TABLE_DEFS[which];
	if (!def) return help();
	cbok(def);
},//»
hndeltab:async()=>{//«
	let which = args.shift();
	if (!which||!TABLE_DEFS[which]||args.length) return help();
	if (!await dbtrans(`DROP TABLE ${which}`)) return cberr(`Could not delete '${which}'`);
	cbok();		
},//»
hnfbup:async()=>{//«
	ERRMESS="";
	if (!await load_firebase()) return cberr(ERRMESS||"Could not create the network interface");
	cbok("OK");
},//»
hnuser:async()=>{//«
	ERRMESS="";
	let opts = failopts(args,{l:{delete:1,all:1,verbose:1},s:{d:1,a:1,v:1}});
	if (!opts) return;
	if (opts.all||opts.a){
		let ret = await dbtrans(`SELECT id FROM user`);
		if (!ret) return cberr(ERRMESS||"Error");
		let arr = Array.from(ret.rows).map(elm=>{return elm.id});
		woutarr(arr);
		cbok();
		return;
	}
	if (!args.length) return help();
	while (args.length) {
		ERRMESS="";
		let who = args.shift();
		if (opts.delete||opts.d){
			let ret = await dbtrans(`DELETE FROM user WHERE id = ?`,[who]);
			if (!ret) werr(ERRMESS||"Error");
			else if (!ret.rowsAffected) werr(ERRMESS||`No such user:\x20${who}`);
			else werr(`Delete OK\x20(${who})`);
		}
		else {
			let user = await get_user(who, opts.verbose||opts.v);
			if (!user) werr(ERRMESS);
			else woutobj(user);
		}
	}
	cbok();
},//»
hnusersubs:async()=>{//«
	const doget=async arr=>{
		for (let id of arr) {
			ERRMESS="";
			let item = await get_item(id, opts.verbose||opts.v)
			if (!item) return werr(ERRMESS||`error getting: ${id}`);
			woutobj(item);
		}
		cbok();
	};
	let opts = failopts(args,{l:{verbose:1,beginning:1,count:1,get:1},s:{v:1,b:1,c:1,g:1}});
	if (!opts) return;
	let if_first = opts.first||opts.f;
	let if_count = opts.count||opts.c;
	let if_get = opts.get||opts.g;

	let who = args.shift();
	if (!who) return help();
	let numstr = args.shift();
	let num;
	if(numstr){
		if (if_count) return help();
		num = numstr.ppi();
		if(!NUM(num)) return help();
	}
	else num = DEF_NUM_STORIES;
	ERRMESS="";
	let rv;
	if (if_count) {
		if (if_get) return help();
		rv = await get_num_user_subs(who);
		if (!rv) return cberr(ERRMESS||"Error");
		cbok(rv);
		return;
	}
	rv = await get_user_subs(who, num, !if_first);
	if (!rv) return cberr(ERRMESS||"Error");
	if (isobj(rv)){
		let arr=[];
		for (let k in rv) arr.push(rv[k]);
		if (if_get) return doget(arr);
		else  woutarr(arr);
	}
	else if (isarr(rv)){
		if (if_get) return doget(rv);
		else woutarr(rv);
	}
	else {
		if (if_get) return doget([rv]);
		else wout(rv);
	}
	cbok();

},//»

}//»

if (!comarg) return Object.keys(COMS);

//Imports«

const{NS,xgetobj,globals,log,cwarn,cerr}=Core;
const{fs,util,widgets,dev_env,dev_mode}=globals;
const{strnum,isarr,isobj,isstr,mkdv}=util;
const {
	readFile,
	get_reader,
	fmt,
	read_stdin,
	woutobj,
	woutarr,
	get_path_of_object,
	pathToNode,
	read_file_args_or_stdin,
	serr,
	normpath,
	cur_dir,
	respbr,
	get_var_str,
	refresh,
	failopts,
	cbok,
	cberr,
	wout,
	werr,
	termobj,
	wrap_line,
	kill_register,
	EOF,
	ENV
} = Shell;
const fsapi=NS.api.fs;
const capi = Core.api;
const fileorin = read_file_args_or_stdin;
const stdin = read_stdin;
const NUM = Number.isFinite;

//»
//Var«

const HN_OBJ_TYPES=[
	"HNItem",
	"HNUser"
];
const CLEAR = {CLEAR:true};
const TIME = {TIME:true};
//const time=()=>{
//	return {TIME:new Date().toUTCString()}
//};
const TAB_WIDTH=4;
const TAB = "\xa0".repeat(TAB_WIDTH);
let DEF_NUM_STORIES = 100;
const gen_story_help=which=>{//«
return `Get a listing of the current ${which} stories, as either full items or numerical ids

General options:
${TAB}--first or -f: Get the first (highest rated) story only
${TAB}--get or -g: Get the full story items rather than the ids
${TAB}--watch or -w: This does not return immediately, but rather listens for changes in the listings
${TAB}--verbose or -v: Show diagnostic output

Render options: These are typically used when sending the listing into a pipeline that ends in a renderer. Each of the below sends the given instruction operator to the renderer.
${TAB}--time or -t: Display a timestamp.
${TAB}--clear or -c: Clear the screen (this is useful when in conjuction with '--watch').

Args:
${TAB}If not getting the first story only, you can specify how many to get. (Default: ${DEF_NUM_STORIES} stories)
`;
};//»
const HN_DB_LONG_NAME = "Hacker News WebSQL database";

const TABLE_DEFS = {//«

text:`id INT PRIMARY KEY,
val TEXT
`,

item: `id BIGINT UNIQUE, 
type CHAR(20),
title CHAR(80),
by CHAR(32),
time BIGINT,
parent BIGINT,
descendants INT,
score INT,
dead INT,
ttyp INT,
text CHAR(255),
kids CHAR(255)
`,

user: `id CHAR(30) UNIQUE,
created BIGINT,
karma INT,
about CHAR(255)
`

};//»
let TABLE_TYPES="";
for (let k of Object.keys(TABLE_DEFS)){
	if (!TABLE_TYPES) TABLE_TYPES = `"${k}"`
	else TABLE_TYPES+=`, "${k}"`
}

//const TABLE_TYPES = Object.keys(TABLE_DEFS).join(", ");

let ERRMESS=null;
const HN_VER="v0";
const HN_BASE_URL = "https://hacker-news.firebaseio.com";
const HN_VER_URL = `${HN_BASE_URL}/${HN_VER}`;
const HN_USER_URL = `${HN_VER_URL}/user`;
const HN_ITEM_URL = `${HN_VER_URL}/item`;
const HN_MAXITEM_URL = `${HN_VER_URL}/maxitem.json`;

const HN_APPNAME = "hackernews";
const HN_DB_NAME = `${HN_APPNAME}-${HN_VER}`;
const HN_DB_DESC = `Hacker News Database - ${HN_VER}`;
let DEF_DB_SIZE = 5*1024*1024;
let ifapi = NS.api.iface;
let is_connected = false;
//»

//Funcs//«

const render=(type, obj, opts={})=>{//«

let str='';
let date = "";
let arr=[];
let is_html=opts.html||opts.h;

const time_str=(secs)=>{
	let date = new Date(secs);
	let tm = date.toLocaleTimeString();
	let arr = date.toUTCString().split(" ");
	arr.pop();
	arr.pop();
	return `${tm} ${arr.join(" ")}`;
}

if (type=="HNUser") {
	arr=[obj.id,`Created: ${(new Date(1000*obj.created)).toDateString()}`, `Karma: ${obj.karma||0}`, `About:${obj.about||""}`];
}
else if (type=="HNItem") {

//	arr=[obj.title,`By: ${obj.by}`,`Time: ${(new Date(1000*obj.time)).toUTCString()}`, `Score: ${obj.score||0}`];
	arr=[obj.title,`By: ${obj.by}`,`Time: ${time_str(1000*obj.time)}`, `Score: ${obj.score||0}`];
	let t = obj.textType;
	if (t==1||t==2){
		let url=obj.text;
		if (is_html) url=`<a href="${url}">${url}</a>`;
		arr.push(`Url: ${url}`);
	}
	else if (t==3||t==4){
		if (is_html) arr.push(`Text: <div>${obj.text}</div>`);
		else arr.push(`Text: ${obj.text}`);
	}
}

if (is_html){
	str = arr.join("<br>");
}
else {
	str = arr.join("\n");
}
return str;

};//»

const NOFB = "The 'hackernews' firebase module is not running\x20(call 'hnfbup' first)";
const nofb=()=>{
	if (ERRMESS) return;
	ERRMESS=NOFB;
};

const get_ref = (path) =>{//«
	let app = get_hn();
	if (!app) return nofb();
	let dbref = firebase.database(app);
	return dbref.ref(path);
};//»

const ascii_safe=(val,nchars)=>{//«
	if (!val) return "";
	val = val.replace(/[^\x09\x0a\x20-\x7e]/g,"\xbf");
	if (nchars && val.length > nchars) {
		if (nchars>3) return val.slice(0, nchars-3)+"...";
		return val.slice(0, nchars);
	}
	return val;
}//»

const HNItem = function(obj){//«

/*
item: `id BIGINT UNIQUE, 
type CHAR(20),
title CHAR(80),
by CHAR(32),
time BIGINT,
parent BIGINT,
descendants INT,
score INT,
dead INT,
ttyp INT,
text CHAR(255),
kids CHAR(255)
*/

	this.id = obj.id;
	this.type = obj.type;
	this.title = obj.title||"";
	this.by = obj.by;
	this.time = obj.time
	this.parent = obj.parent||null;
	this.descendants = obj.descendants||0;
	this.score = obj.score || 0;
	this.dead = obj.dead?true:false;
	this.textType = obj.ttyp;
	this.text = obj.text;
	if (isstr(obj.kids)) this.kids = JSON.parse(obj.kids);
	else this.kids = obj.kids;

};//»
const HNUser = function(obj){//«
	this.id = obj.id;
	this.created = obj.created;
	this.karma = obj.karma||0;
	this.about = obj.about||"";
};//»
const dbtrans = (str, arr=[], if_force)=>{//«
	return new Promise((y,n)=>{
		if (window.openDatabase){
			try {
				let db = window.openDatabase(HN_DB_NAME, '', HN_DB_DESC, DEF_DB_SIZE);
				db.transaction(tx=>{
					tx.executeSql(str, arr, (tx,res)=>{
						y(res);
					}, (tx, err)=>{
cerr("executeSql", err.message);
//						ERRMESS=err.message;
						cberr(err.message);
//						y();
					});
				});
			}
			catch(e){
cerr(e);
				cberr(`dbtrans: caught: ${e.message}`);
//				y();
			}
		}
		else cberr("Your browser does not support the WebSQL API");
	});
};//»
const load_iface=()=>{//«
    return new Promise(async(Y,N)=>{
        let rv = await fsapi.loadMod("iface.iface",{STATIC:true});
        if (!rv) return Y();
        Y(true);
    });
}; //»
const load_firebase=()=>{//«
    return new Promise(async(y,n)=>{
        ifapi = NS.api.iface;
        if (!ifapi) {
            if (!await load_iface()) return y("Could not load the interface module!");
            ifapi = NS.api.iface;
        }
		if (!window.firebase) {
			if (!ifapi.didInit()){
				if (!(await ifapi.init())) return y("Could not initialize the realtime database!");
			}
		}
		if (get_hn()) return y(true);
//		else if (ERRMESS) return y();

try {
		firebase.initializeApp({databaseURL:HN_BASE_URL }, HN_APPNAME);
}
catch(e){
log(e);
ERRMESS=e.message;
y();
return;
}
		firebase.database().ref(".info/connected").on("value", snap=>{
			if (snap.val() === true){
cwarn("Connected to firebase: "+HN_APPNAME);
				y(true);
			}       
			else{   
cwarn("firebase is disconnected: "+HN_APPNAME);
			}
		});
    });
};//»
const get_hn = ()=>{//«
	if (!window.firebase) return false;
	ifapi = NS.api.iface;
	if (!ifapi) return false;
	if (!ifapi.isConnected()){
		ERRMESS="Firebase is disconnected";
		return false;
	}
	for (let app of firebase.apps){
		if (app.name==HN_APPNAME) return app;
	}
	return false;
};//»
const help=()=>{//«
	let str = coms_help[com];
	if (!str) return cberr("Error");
	let arr = str.split("\n");
	arr[0] = `${com}: ${arr[0]}`
	for (let ln of arr) {
		if (!ln) werr("\xa0");
		else werr(fmt(ln));
	}
	cberr();
};//»
const get_stories=async (which)=>{//«
	return new Promise(async(y,n)=>{
		const doget=async arr=>{
			let out = [];
			if (if_clear) woutobj(CLEAR);
			if (if_time) woutobj(TIME);
			for (let id of arr) {
				ERRMESS="";
				let item = await get_item(id, opts.verbose||opts.v)
				if (!item) werr(ERRMESS||`error getting: ${id}`);
				else woutobj(item);
			}
			if (!if_watch) cbok();
		};
		let opts = failopts(args,{l:{time:1,clear:1,verbose:1,first:1,watch:1,get:1},s:{t:1,c:1,v:1,f:1,w:1,g:1}});
		if (!opts) return;
		let if_first = opts.first||opts.f;
		let if_get = opts.get||opts.g;
		let if_watch = opts.watch||opts.w;
		let if_clear = opts.clear||opts.c;
		let if_time = opts.time||opts.t;
		let numstr = args.shift();
		let num;
		if (numstr){
			if (if_first) return help(`hn${which}`);
			num = numstr.ppi();
			if (!NUM(num)) return help(`hn${which}`);
		}
		else if (if_first) num = 1;
		else num = DEF_NUM_STORIES;
		ERRMESS="";
		let ref = get_ref(`/v0/${which}stories`)
		if (!ref) return cberr(ERRMESS||NOFB);
		ref = ref.limitToFirst(num);
		if(if_watch){
			werr(`Watching: ${which}stories`);
			kill_register(cb=>{
				if (ref) ref.off();
				cb&&cb();
			});
			ref.on('value',rv=>{
				let val = rv.val();
				if (!val) return cberr("Error");
				if (if_first) {
					if (if_get) return doget([val[0]]);
					if (if_clear) woutobj(CLEAR);
					if (if_time) woutobj(TIME);
					wout(val[0]);
				}
				else {
					if (if_get) return doget(val);
					if (if_clear) woutobj(CLEAR);
					if (if_time) woutobj(TIME);
					woutarr(val);
				}
			});
		}
		else {
			ref.once('value',rv=>{
				let val = rv.val();
				if (!val) return cberr("Error");
				if (if_get) return doget(val);
				if (if_time) woutobj(TIME);
				if (if_first) wout(val[0]);
				else woutarr(val);
				cbok();
			});		
		}

	});
};//»
const get_fbase=(path)=>{//«
	return new Promise(async(y,n)=>{
		let ref = get_ref(`/v0/${path}`);
		if (!ref) return y();
		ref.once('value',snap=>{ 
			y(snap.val());
		});
	});
};//»
const get_user = (who,if_verbose)=>{//«
	return new Promise(async(y,n)=>{
		let rv = await dbtrans(`SELECT * FROM user WHERE id = ?`,[who]);
		if (rv.rows.length) {
			if (if_verbose) werr(`Using cache: ${who}`);
			return y(new HNUser(rv.rows[0]));
		}
		if (if_verbose) werr(`Fetching: ${who}`);
		rv = await get_fbase(`user/${who}/created`);
		if (!rv) {
			if(!ERRMESS) ERRMESS=`${who}: user not found`;
			y();
			return;
		}
		let obj = {
			id: who,
			created: rv,
			karma: await get_fbase(`user/${who}/karma`),
		};
		rv = await get_fbase(`user/${who}/about`);
		if (rv){
			let dv = mkdv();
			dv.innerHTML = rv;
			rv = ascii_safe(dv.innerText, 255)
		}
		else rv = "";
		obj.about = rv;
		rv = await dbtrans("INSERT INTO user VALUES (?,?,?,?)", [obj.id, obj.created, obj.karma||0, obj.about]);
		if (rv&&rv.rowsAffected) y(new HNUser(obj));
		else {
			ERRMESS=`Insert failed: ${who}`;
			y();
		}
	});
};//»
const get_user_subs=(who, num, if_recent)=>{//«
	return new Promise(async(y,n)=>{
		let ref = get_ref(`/v0/user/${who}/submitted`);
		if (!ref) return y();
		if (num) {
			if (if_recent) ref = ref.limitToFirst(num);
			else ref = ref.limitToLast(num);
		}
		ref.once('value',rv=>{
			y(rv.val());
		});		
	});
};//»
const get_num_user_subs = (who)=>{//«
	return new Promise(async(y,n)=>{
		let rv = await get_user_subs(who, 1, false);
		if (!rv) return y();
		y(Object.keys(rv)[0]);
	});
};//»
const get_item = (id,if_verbose) =>{//«

return new Promise(async(y,n)=>{

let ret = await dbtrans(`SELECT * FROM item WHERE id = ${id}`);

if (ret&&ret.rows.length){//«
if (if_verbose) werr(`Using cache: ${id}`);
let item = ret.rows[0];
if (item.ttyp==2||item.ttyp==4){
	let rv = await dbtrans(`SELECT val from text WHERE rowid = ${item.text}`);
	if (rv.rows.length) item.text = rv.rows[0].val;
	else {
cerr("Could not get the item text!");
		item.text="\xbf";
	}
}
else if(item.ttyp==2){
cwarn("!!!");
log(item);
}
	y(new HNItem(item));
	return;
}//»

if (if_verbose) werr(`Fetching: ${id}`);
let ref = await get_ref(`/v0/item/${id}`);
if (!ref) return y();
ref.once('value',async rv=>{
let obj = rv.val();
if (!obj) {
ERRMESS = `Item not found: ${id}`;
//	return cberr(`Not found: ${id}`);
y();
return;
}
let ttyp;
let text;
let usetext;
if (usetext=obj.url) {
	ttyp=1;
	if (obj.url.length <= 255) {
		ttyp=1;
		text = obj.url;
	}
	else {
		let rv = await dbtrans("INSERT INTO text (val) VALUES (?)", [obj.url]);
		if (!rv.rowsAffected){
cerr("Error inserting text!");
			text = "\xbf";
			ttyp = 0;
		}
		else {
			text=rv.insertId+"";
			ttyp = 2;
		}
	}
}
else if (usetext=obj.text){
	ttyp = 3;
	if (obj.text.length <= 255) {
		ttyp=3;
		text = obj.text;
	}
	else {
		let rv = await dbtrans("INSERT INTO text (val) VALUES (?)", [obj.text]);
		if (!rv.rowsAffected){
cerr("Error inserting text!");
			text = "\xbf";
			ttyp = 0;
		}
		else {
			text=rv.insertId+"";
			ttyp = 4;
		}
	}
}
else {
	usetext = text = "\xbf";
	ttyp = 0;
}

let kids = obj.kids||[];
let kidstr = JSON.stringify(kids);
while(kidstr.length>255){
	kids.pop();
	kidstr = JSON.stringify(kids);
}
let arr = [
	obj.id,
	obj.type,
	obj.title || "",
	obj.by,
	obj.time,
	obj.parent || 0,
	obj.descendants || 0,
	obj.score || 0,
	(obj.dead ? 1 : 0),
	ttyp,
	text,
	kidstr
];
ret = await dbtrans("INSERT INTO item VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", arr);
if (ret.rowsAffected) {
	y(new HNItem({
		id:arr[0],
		type:arr[1],
		title:arr[2],
		by:arr[3],
		time:arr[4],
		parent:arr[5],
		descendants:arr[6],
		score:arr[7],
		dead:arr[8],
		ttyp:arr[9],
		text:usetext,
		kids:kids
	}));
}
else {
	ERRMESS=`Insert failed: ${id}`;
	y();
}

});

})

}//»

//»

const get_date_obj=(fname)=>{//«

return new Promise(async(y,n)=>{
if (!fname) return cberr("No file arg!");
	let dat = await readFile(fname);
	if (!dat) return cberr(`${fname}: not found`);
	if (!(isarr(dat) && isstr(dat[0]))) return cberr(`Invalid file data!`);
	let obj;
	try{
		y(JSON.parse(dat.join("\n")));
	}
	catch(e){
		cberr("JSON.parse error");
		return;
	}
});

};//»

const gettime=id=>{//«
	return new Promise(async(y,n)=>{
		let ref = get_ref(`/v0/item/${id}/time`);
		if (!ref) {
			werr(`Reference error: ${id}`);
			return y();
		}
		ref.once('value',snap=>{
			let val = snap.val();
			if (!NUM(val) && val > 0){
				werr(`Value error: ${id}`);
				return y();
			}
			y(val);
		});
	});
};//»

const coms_help={//«
hnwalkback:`Walk back from an item number (or the current maxitem), at a certain "step", in order
to make a mapping between item times and id numbers, as an aid to historical analysis of the Hacker
News database.

Options:
${TAB}--skip or -s: The skip factor between item numbers. Smaller values mean longer times and larger databases. The default is 1000.
${TAB}--floor or -f: The floor time value (Unix seconds). The algorithm stops when this value is reached.

Args:
${TAB}Name of a file to save the raw binary data of record format [id timestamp]*. (required)
${TAB}Item number to start from. (Optional)`,
hnitemkids:`Wait for the 'kids' property (comments) of an HNItem (story or comment) to be updated.

Args:
${TAB}The numerical id of the item (required)
`,
hnsql:`Run an arbitrary SQL command on the WebSQL database: '${HN_DB_NAME}'.
This always fails if the WebSQL API is not supported by your browser (supported=${!!window.openDatabase}).

Example:
${TAB}hnsql "SELECT * FROM user WHERE karma < 0"
`,
hnpipe:`Read the stdin pipe stream in order to transform HN data structures (JS objects) into application specific objects or string (eg, for computation or rendering).
`,
hntop:gen_story_help("top"),
hnbest:gen_story_help("best"),
hnshow:gen_story_help("show"),
hnask:gen_story_help("ask"),
hnnew:gen_story_help("new"),
hnjob:gen_story_help("job"),
hnitem:`Get an item (story or comment) by its id and save it locally in the ${HN_DB_LONG_NAME}

Options:
${TAB}--delete or -d: Delete this item from the database rather than getting it
${TAB}--verbose or -v: Show diagnostic output

Args:
${TAB}The numerical id of the item (required)
`,
hnmktab:`Make the tables for the ${HN_DB_LONG_NAME}

Options:
${TAB}--all or -a: Construct all tables

Args:
${TAB}If the "all" option is not specified, there must be a single arg, one of: ${TABLE_TYPES}
`,
hndesctab:`Describe the structure of a table in the ${HN_DB_LONG_NAME}

Args:
${TAB}One of: ${TABLE_TYPES} (required)
`,
hndeltab:`Delete (issue a DROP command for) a table in the ${HN_DB_LONG_NAME}

Args:
${TAB}One of: ${TABLE_TYPES} (required)
`,
hnfbup:`Bring up the network interface for the Hacker News Firebase realtime database`,
hnuser:`Get a user entity and save it locally in the ${HN_DB_LONG_NAME}

Options:
${TAB}--delete or -d: Delete this user entity from the database rather than getting it
${TAB}--all or -a: Output a list of the user's names that are stored locally
${TAB}--verbose or -v: Show diagnostic output

Args:
${TAB}The name[s] of the user[s] (At least one is required)
`,
hnusersubs:`Get a list of the submissions (story or comment) of a user either as full items or numerical ids

Options:
${TAB}--count or -c: Get a count of the number of submissions rather than a list
${TAB}--beginning or -b: Get the earliest submissions rather than the most recent
${TAB}--get or -g: Get the full items rather than their numerical ids
${TAB}--verbose or -v: Show diagnostic output

Args:
${TAB}If the "count" option is not specified, you may specify how many to get. (Default: ${DEF_NUM_STORIES} submissions)
`
}
//»


COMS[comarg](args);

/*
if (!com) return Object.keys(COMS)

if (!args) return coms_help[com];
if (!COMS[com]) return cberr("No com: " + com + " in net.hn!");
if (args===true) return COMS[com];
COMS[com](args);
*/


}




/*
hnmkdb:async()=>{//«

	let rv;
	rv = await dbtrans(`CREATE TABLE IF NOT EXISTS item (id BIGINT UNIQUE, type CHAR(20), title CHAR(80), by CHAR(20), time BIGINT, text TEXT, parent BIGINT, kids TEXT, descendants INT, score INT, dead BOOLEAN)`);
	if (!rv) return cberr("Failed to make table 'item'");
	rv = await dbtrans(`CREATE TABLE IF NOT EXISTS user (id CHAR(30) UNIQUE, created BIGINT, karma INT, about TEXT)`);
	if (!rv) return cberr("Failed to make table 'user'");
	cbok();

},//»

hnmax:async()=>{//«

	let opts = failopts(args,{l:{once:1},s:{o:1}});
	if (!opts) return;
	if (opts.once||opts.o){
		let rv = await fetch(HN_MAXITEM_URL);
		if (rv.ok!==true) return cberr("Bad response");
		let txt = await rv.text();
		cbok(txt);
		return;
	}

	let maxref;
	kill_register(cb=>{
		if (maxref) maxref.off();
		cb&&cb();
	});
	let app = get_hn();
	if (!app) return nofb();
	let dbref = firebase.database(app);
	maxref = dbref.ref('/v0/maxitem');
	maxref.on('value',snap=>{
		let val = snap.val();
		wout(val.toString());
	});

},//»
hnupds:async()=>{//«
	let opts = failopts(args,{l:{once:1},s:{o:1}});
	if (!opts) return;
	if (opts.once||opts.o){
		let rv = await fetch(`${HN_VER_URL}/updates.json`);
		if (rv.ok!==true) return cberr("Bad response");
		woutobj(await rv.json());
		cbok();
		return;
	}
	let updref;
	kill_register(cb=>{
		if (updref) updref.off();
		cb&&cb();
	});
	let app = get_hn();
	if (!app) return nofb();
	let dbref = firebase.database(app);
	updref = dbref.ref('/v0/updates');
	updref.on('value',snap=>{
		let val = snap.val();
		woutobj(val);
	});
},//»
hnuser:async()=>{//«

	let opts = failopts(args,{l:{delete:1},s:{d:1}});
	if (!opts) return;

	let who = args.shift();
	if (!who) return cberr("Need a user arg!");

	let ifdel = opts.delete||opts.d;

	let ret;
	if (ifdel){
		ret = await dbtrans(`DELETE FROM user WHERE id = ?`,[who]);
		if (!ret.rowsAffected) return cberr(`No such user:\x20${who}`);
		if (!await dbtrans(`DROP TABLE "subs-${who}"`)){
			werr(`Could not delete submissions table for: ${who}`);
		}
		cbok(`Delete OK\x20(${who})`);
		return;
	}
	ret = await dbtrans(`SELECT * FROM user WHERE id = ?`,[who]);
	if (!ret.rows.length){
		let rv = await fetch(`${HN_USER_URL}/${who}.json`);
		let obj = await rv.json();


		if (obj===null) return cberr(`${who}:\x20not found`);
		let arr = [obj.id, obj.created, obj.karma||0, obj.about||""];
		ret = await dbtrans("INSERT INTO user VALUES (?,?,?,?)", arr);
		if (ret.rowsAffected) {
			werr(`Insert OK: ${who}`);
			if (await dbtrans(`CREATE TABLE IF NOT EXISTS "subs-${who}" (id BIGINT UNIQUE)`)){
				let subs = obj.submitted;
				if (subs.length) {
					subs.reverse();
					while (subs.length){
						let str = subs.splice(0,1000).map(v=>{return `(${v})`}).join(",");
						ret = await dbtrans(`INSERT INTO "subs-${who}" VALUES ${str}`);
						if (!ret) {
							werr(`Failed to insert submissions into: subs-${who}`);
							break;
						}
					}
				}
			}
			woutobj(new HNUser(obj));
			cbok();
		}
		else cberr(`Insert failed: ${who}`);
	}
	else{
		woutobj(new HNUser(ret.rows[0]));
		cbok();
	}

},//»
hnsubs:async()=>{//«
	let who = args.shift();
	if (!who) return cberr("Need a user arg!");
	let ret = await dbtrans(`SELECT * FROM "subs-${who}"`);
	if (!ret) return cberr(`${who}: the user is not in the database`);
	if (ret.rows.length) {
		let arr = Array.from(ret.rows).map(obj=>obj.id);;
		werr("Count: "+arr.length);
		wout(arr);
	}
	else werr("No submissions");
	cbok();
},//»
hnitem:async()=>{//«
	let opts = failopts(args,{l:{delete:1},s:{d:1}});
	if (!opts) return;
	let item = args.shift();
	if (!item) return cberr("Need an item arg!");
	let ifdel = opts.delete||opts.d;

	let itemnum = item.ppi();
	if (!NUM(itemnum)) return cberr(`Invalid item id: ${item}`);

	let ret;
	if (ifdel){
		ret = await dbtrans(`DELETE FROM item WHERE id = ${item}`);
		if (!ret.rowsAffected) return cberr(`No such item:\x20${item}`);
		cbok();
		return;
	}
	ret = await dbtrans(`SELECT * FROM item WHERE id = ${item}`);
	if (!ret.rows.length){
		let rv = await fetch(`${HN_ITEM_URL}/${item}.json`);
		let obj = await rv.json();
		if (obj===null) return cberr(`${item}:\x20not found`);
		let arr = [obj.id, obj.type, obj.title||"", obj.by, obj.time, obj.url||obj.text|| "", obj.parent||0, JSON.stringify(obj.kids||[]) ,obj.descendants||0, obj.score||0, obj.dead||0];
		ret = await dbtrans("INSERT INTO item VALUES (?,?,?,?,?,?,?,?,?,?,?)", arr);
		if (ret.rowsAffected) {
			werr(`Insert OK: ${item}`);
//			woutobj(new HNItem(ret.rows[0]));
			woutobj(new HNItem(obj));
			cbok();
		}
		else cberr(`Insert failed: ${item}`);
	}
	else{
		woutobj(new HNItem(ret.rows[0]));
		cbok();
	}

},//»
hnwaititem:()=>{//«
	let opts = failopts(args,{l:{},s:{}});
	if (!opts) return;
	let item = args.shift();
	if (!item) return cberr("Need an item arg!");
	let ifdel = opts.delete||opts.d;

	let itemnum = item.ppi();
	if (!NUM(itemnum)) return cberr(`Invalid item id: ${item}`);

	let ref = get_ref(`/v0/item/${item}`);
	kill_register(cb=>{
		if (ref) ref.off();
		cb&&cb();
	});
	if (!ref) return;
	ref.on('value',snap=>{
//		woutarr(snap.val());
log(snap.val());

	});
},//»
hnwaititemkids:()=>{//«
	let opts = failopts(args,{l:{},s:{}});
	if (!opts) return;
	let item = args.shift();
	if (!item) return cberr("Need an item arg!");
	let ifdel = opts.delete||opts.d;

	let itemnum = item.ppi();
	if (!NUM(itemnum)) return cberr(`Invalid item id: ${item}`);

	let ref = get_ref(`/v0/item/${item}/kids`);
	kill_register(cb=>{
		if (ref) ref.off();
		cb&&cb();
	});
	if (!ref) return;
	ref.on('value',snap=>{
//		woutarr(snap.val());
log(snap.val());

	});
},//»
hnitemtitle:async()=>{//«

	let item = args.shift();
	if (!item) return cberr("Need an item arg!");
	let itemnum = item.ppi();
	if (!NUM(itemnum)) return cberr(`Invalid item id: ${item}`);

	let rv = await fetch(HN_ITEM_URL+`/${itemnum}/title.json`);
	let val = await rv.json();
	if (!val) return cberr("Not found");
	if (rv.ok!==true) return cberr("fetch error");
	cbok(val);
}//»
*/





