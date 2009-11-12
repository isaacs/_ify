// _ify — An itty bitty currying utility.

(function () {

// Use exports if we're in a CommonJS-like env, or else just the global obj.
var GLOBAL = (typeof exports !== 'undefined') ? exports : this;

// let folks restore the old state, for browser situations where one might
// want to use this alongside underscore.js or some other library that uses
// this symbol.
var saved = {
	global : {},
	fnproto : {},
	symbol : {},
	targets : {"global":GLOBAL, "fnproto":Function.prototype},
	cannon : {_:_,___:___},
	loaded : false
};

___.load = _.load = load;
___.unload = _.unload = unload;

// you know when you say a word 1000 times and it loses all meaning?
function unload () {
	var ret = {_:_, ___:___, load:load, unload:unload};
	if (!saved.loaded) return ret;
	saved.loaded = false;
	["_", "___"].forEach(function (symbol) {
		for (var t in saved.targets) if (saved.targets.hasOwnProperty(t)) {
			var target = saved.targets[t];
			if (saved[t].hasOwnProperty(symbol)) target[symbol] = saved[t][symbol];
			else delete target[symbol];
		}
	});
	return ret;
};
unload.load = function (symbols) {
	return unload().load(symbols);
};
function load (symbols) {
	if (saved.loaded) throw new Error(
		"Please unload before trying to load new symbols."
	);
	saved.loaded = true;
	["_","___"].forEach(function (symbol) {
		if (!symbols.hasOwnProperty(symbol)) return;
		for (var t in saved.targets) if (saved.targets.hasOwnProperty(t)) {
			var target = saved.targets[t];
			if (target.hasOwnProperty(symbols[symbol])) saved[t][symbol] = target[symbols[symbol]];
			else delete saved[t][symbol];
			target[symbols[symbol]] = saved.cannon[symbol];
		}
	});
	return {_:_, ___:___, load:load, unload:unload};
};
// symbolsymbolsymbolsymbolsymbolsymbolsymbol...

// auto-load the defaults
load({ _ : "_", ___ : "___"});

// Enough talk.  It's business time.

function _ (fn) { return shared(_, arguments, this, fn) };
function ___ (fn, scope) { return shared(___, arguments, this, fn, true) };

function shared (u, origArgs, me, fn, scope) {
	if (typeof(me) !== "function") {
		if (typeof(fn) !== "function") throw new TypeError(
			"Invalid argument(s) to "+u.name
		);
		// make _(fn,1,2) identical to fn._(1,2) or _(fn)(1,2)
		return (origArgs.length > (scope?2:1)) 
			? curry(origArgs[0], arr(origArgs, scope?1:0), scope && origArgs[0])
			: function _ified () {
				return u.apply(origArgs[0], arr(origArgs, 1).concat(arr(arguments,0)));
			};
	}
	return curry(me, arr(origArgs, scope?1:0), scope && origArgs[0]);
};

function curry (fn, args, scope, call) {
	for (
		var i = 0, l = args.length; i < l; i ++
	) if (
		args[i] === _ || args[i] === ___
	) return fixArgs(fn, args, scope);
	
	if (call === _) {
		return fn.apply(scope || this, args);
	}
	return function _ified () {
		return curry(fn, args.concat(arr(arguments,0)), scope || this, _);
	};
};

function fixArgs (fn, fixedArgs, scope) { return function _ified () {
	var newArgs = [];
	for (
		var f = 0, fl = fixedArgs.length, a = 0, al = arguments.length;
		f < fl;
		f ++
	) if (
		fixedArgs[f] === _ // fill with 1
	) newArgs.push(a < al ? arguments[a++] : _);
	else if (
		fixedArgs[f] === ___ // fill with the rest
	) newArgs = newArgs.concat(
		a < al ? arr(arguments, a)
		: ___
	), a = al;
	else newArgs.push(fixedArgs[f]);
	
	return curry.call(this, fn, newArgs, scope, _);
}};

function arr (a, i) { return Array.prototype.slice.call(a, i || 0) };

})();