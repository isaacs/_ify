
# _ify – an itty bitty curry utility

transform the function such that you can fix any of the arguments,
passing `_` as a "placeholder".

If any places are not filled, it returns a "callback" instead of executing the function.
It also returns a callback the first time, even if you didn't give it any holes.
(But in that case, it's not awaiting anything so just () will execute it.)

An underbar `_` is a "hole".  It keeps trying to fill the holes until there are none left.
Once you've \_ified the function, it can receive holes, and will handle them
appropriately.  When all the holes are filled, it executes the function.

A triple-underbar \_\_\_ is a bigger hole.  The remaining arguments all fall into it.

Enough talk. Example time!

	function timesSquared (x, y) { return x * y * y }
	var times2Squared = _(timesSquared)( _, 2 ) or timesSquared._(_, 2);
	times2Squared(3) = timesSquared(3, 2) = 12

In the \_ified function, if all the spaces are not filled in, it returns
another \_ified function with the remaining spaces blank.

More examples:

	f._(_,_) ==> curryable function requiring 2 args
	f._(_,_)(x) ==> f._(x,_) ==> function curried to 1 arg, requiring one more for execution
	f._(_)._(_) ==> passing _ leaves the hole open, so this is the same as just f._(_)

in general, doing .\_() just needs to happen once.	doing it a second time is unnecessary.

	f._(_)(_,_) ==> passes _ as the first arg, then the second, so it's the same as f._(_,_)
	f._(_,_)(_,_,_) ==> f._(_,_,_)
	f._(_,_,_)(1,_,2) ==> f._(1,_,2) still awaiting second argument.
	f._(_,_,_)(1,_,2)(3) ==> f._(1,_,2)(3) ==> f(1,3,2)
	f._(_,1)(2,3,4) ==> f(2,1,3,4) additional args are appended to list.
	f._(___,_,1) ==> additional args go in the ___ member, if one is provided.
	f._(___,_,1)(2) ==> f._(___,2,1) right-hand curried with 2,1
	f._(___,_,1)(2)(3,4,5) ==> f._(___,2,1)(3,4,5) ==> f(3,4,5,2,1)
	f._(___,1,2) is just like Y.rbind(f, null, 1, 2)
	f._(1,___,_,2)(3,4,5) ==> f._(1,___,3,2)(4,5) ==> f(1,4,5,3,2)

extra args will go into the first \_\_\_ that is found. so, if there are two, you have to call it twice.

	f._(___,___)(1,2)(3,4,5) ==> f._(1,2,___)(3,4,5) ==> f(1,2,3,4,5)

furthermore...

	_(f) === f._
	_(f)(1,_) === f._(1,_)
	// etc.

But wait! There's more!

	f._(1,2,3) ==> ?

No holes, so what happens?
It doesn't quite make sense to have it just do the same thing as `f(1,2,3)`
So, instead, it returns a callback that can take \_ arguments.

So:

	f._(1,2,3)(a,_,c)(b) === f(1,2,3,a,b,c)
	setTimeout(foo._(bar)),0) === setTimeout(function () { foo(bar) }, 0)
	f._()(1,_,2,___)(3)(4,5,6) === f._(1,3,2,___)(4,5,6) === f(1,3,2,4,5,6)
	f._(1,2)(___,3,4)(5,6) === f._(1,2,___,3,4)(5,6) === f(1,2,5,6,3,4)

So how do I fix scope, you ask?

With the \_\_\_!

It works just like \_, but the first argument is used to set the scope.

so,

	f.___(obj, 1, 2) ==> function () { return f.call(obj, 1, 2) }

This doesn't execute immediately, because remember there's always at least one
level of indirection (otherwise it's pointless, and you can always add ()
if you really want it to execute right away.)

This one executes right away, because there's already a single redirection.

	___(f, obj)(1, 2) ==> f.___(obj)(1,2) ==> (function () { return f.call(obj, 1, 2) } )()

And of course, this works, too:

	f.___(obj, 1)(_, 2)(3) ==> f.call(obj, 1, 3, 2)

## But I don't like \_ and \_\_\_ (or I'm already using them for something else)

That's fine.  You can use the \_.load and \_.unload functions to swap out new symbols.  Maybe you like
to call them $ and $$$ instead of \_ and \_\_\_.  Great.  Just do this:

	\_.unload.load({\_:"$", \_\_\_:"$$$"})

Any string is fine, but some will lead to uglier code, of course.  This is not pretty:

	myFunction["BLΩRHEHA(F#HA(HFZZXNBFZ..#H(A"](window["BLΩRHEHA(F#HA(HFZZXNBFZ..#H(A"], 2)

`ƒ` and `µ` are valid and pretty identifiers and reasonably pretty and easy to type (on a mac).
You could even remove all global references to \_ and \_\_\_, and just use them as private vars.
The \_.unload() function returns an object with references to \_ and \_\_\_, so you can
do whatever you want with that. For instance:

	var myUnderscore = _.unload();

and then \_ is at `myUnderscore._` and \_\_\_ is on `myUnderscore.___`, and you can use
them just as if they were the globals.  For example:

	_.unload.load({ _ : "$", ___ : "derp" }); // unload the globals, and load the new ones.
	$(f)(1,2,3) ==> f(1,2,3)
	$(f)(1,$,2)(3) ==> f(1,3,2)
	f.$(1,$,2)(3,$)($,4)(5) ==> f.$(1,3,2,$)($,4)(5) ==> f.$(1,3,2,$,4)(5) ==> f(1,3,2,5,4)
	f.derp(obj, $, 1)(2) ==> f.call(obj, 2, 1)
	f.$(derp, 1, 2)(4,5,6) ==> f(4,5,6,1,2)

Basically, you'd just be changing the symbol that's used in all the examples below.  From now on, I'm going to use `_` and `___`, because think those are prettiest.

