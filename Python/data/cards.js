// Python Cheatsheet — cards.js
// Sources: docs.python.org, numpy.org, pandas.pydata.org, matplotlib.org, pydantic.dev, pytest.org, sqlalchemy.org

const CARD_DATA = {

// ═══════════════════════════════════════════════════════════════
//  PAGE 1 — CORE LANGUAGE
// ═══════════════════════════════════════════════════════════════

"types & literals::numeric types": {
  summary: "Python has three numeric types: <code>int</code> (arbitrary precision), <code>float</code> (IEEE 754 double), and <code>complex</code> (a+bj). Integers never overflow. Floats use C <code>double</code> — see <code>sys.float_info</code> for platform precision. <code>int</code> has additional methods: <code>bit_length()</code> (bits needed to represent the value), <code>bit_count()</code> (Python 3.10, popcount of 1-bits), and <code>to_bytes()</code>/<code>from_bytes()</code> for binary conversion. <code>float()</code> accepts <code>'nan'</code>, <code>'inf'</code>, and <code>'-inf'</code> as string inputs. Use <code>Decimal</code> for exact decimal arithmetic (money); <code>Fraction</code> for exact rational arithmetic.",
  when_to_use: "Use <code>int</code> for counts and indices. Use <code>float</code> for scientific/engineering work where approximation is fine. Use <code>Decimal</code> for financial calculations. Use <code>math.isclose(a, b, rel_tol=1e-9)</code> for float comparisons — never <code>a == b</code>.",
  gotchas: ["<code>0.1 + 0.2 == 0.3</code> is <code>False</code> — float arithmetic is not exact. Use <code>math.isclose(a, b)</code>", "<code>round()</code> uses banker's rounding (half-to-even): <code>round(0.5) == 0</code>, <code>round(1.5) == 2</code>, <code>round(2.5) == 2</code>. Use <code>Decimal</code> with <code>ROUND_HALF_UP</code> for traditional rounding", "Integer division <code>//</code> floors toward negative infinity: <code>-7 // 2 == -4</code>, not <code>-3</code>"],
  example: `import math, sys
from decimal import Decimal, ROUND_HALF_UP

# int — arbitrary precision
x = 10 ** 100
print(x.bit_length())        # 333 (bits needed)
print((19).bit_count())      # 3   (popcount, Python 3.10+)
print((255).to_bytes(2, "big"))  # b'\x00\xff'

# float
print(math.isclose(0.1+0.2, 0.3))  # True
print(float("inf"), float("nan"))   # inf nan
print(sys.float_info.dig)           # significant decimal digits (~15)

# round() uses banker's rounding (half-to-even)!
print(round(0.5))   # 0  (not 1)
print(round(1.5))   # 2
print(round(2.5))   # 2  (not 3)

# Decimal for money / exact rounding
total = (Decimal("2.5")).quantize(
    Decimal("1"), rounding=ROUND_HALF_UP)  # 3

# Numeric literals
hex_val = 0xFF; bin_val = 0b1010; big = 1_000_000`
},

"types & literals::booleans & none": {
  summary: "<code>bool</code> is a subclass of <code>int</code>: <code>True == 1</code>, <code>False == 0</code>. <code>None</code> is a singleton. Truthiness is determined by <code>__bool__()</code> (returns False) or <code>__len__()</code> (returns 0) — any object not implementing either is truthy by default. Falsy values: <code>None</code>, <code>False</code>, <code>0</code>, <code>0.0</code>, <code>0j</code>, <code>Decimal(0)</code>, <code>Fraction(0,1)</code>, <code>''</code>, <code>[]</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>. Boolean operators <code>or</code>/<code>and</code> return one of their operands, not necessarily <code>True</code>/<code>False</code> — this enables the <code>x = val or default</code> pattern.",
  when_to_use: "Always use <code>is None</code> / <code>is not None</code> — never <code>== None</code> (any class can override <code>__eq__</code>). Use bare truthiness <code>if items:</code> instead of <code>if len(items) > 0:</code>. Use <code>bool(x)</code> to explicitly convert.",
  gotchas: ["<code>bool</code> inherits from <code>int</code>: <code>True + True == 2</code>, <code>sum([True, False, True]) == 2</code>", "<code>or</code>/<code>and</code> return an operand, not a bool: <code>'a' or 'b'</code> returns <code>'a'</code>, <code>0 or 'b'</code> returns <code>'b'</code>. Use <code>bool(x or y)</code> if you need an actual bool", "Empty numpy arrays raise <code>ValueError</code> on truthiness — use <code>arr.size</code> or <code>len(arr)</code> instead"],
  example: `# Falsy values — all evaluate to False
import decimal, fractions
falsy = [None, False, 0, 0.0, 0j,
         decimal.Decimal(0), fractions.Fraction(0,1),
         "", [], {}, set(), range(0)]
print(all(not bool(x) for x in falsy))  # True

# Truthiness via __bool__ / __len__
class AlwaysFalse:
    def __bool__(self): return False
# AlwaysFalse() is falsy despite having no __len__

# or/and return operands (not bools)
print("a" or "b")       # "a"  (first truthy)
print(0 or "default")   # "default"
print(0 and "never")    # 0    (first falsy)
print(None or [] or 42) # 42   (first truthy)

# Idioms
config = None
value = config or {}         # default if None/falsy
name = input_name or "guest" # fallback

# None checks — always use "is"
result = None
if result is None:    # correct
    print("not found")
print(sum([True, False, True, True]))  # 3`
},

"types & literals::type conversion": {
  summary: "Python's built-in conversion functions: <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code>, <code>list()</code>, <code>tuple()</code>, <code>set()</code>, <code>dict()</code>, <code>bytes()</code>, <code>chr()</code>/<code>ord()</code>. These call the type's constructor. <code>repr()</code> gives a developer-oriented string; <code>str()</code> gives a user-friendly string.",
  when_to_use: "Use <code>int(x, base)</code> to parse hex/octal/binary strings. Use <code>list()</code> to materialise any iterable. Use <code>frozenset()</code> when you need a hashable set. Use <code>bytes(n)</code> for n zero bytes, <code>bytes(iterable)</code> from int list, <code>bytes(string, encoding)</code> to encode.",
  gotchas: ["<code>int(3.9)</code> truncates toward zero — result is <code>3</code> not <code>4</code>. Use <code>round()</code> for rounding", "<code>bool('False')</code> is <code>True</code> — any non-empty string is truthy. Parse booleans explicitly"],
  example: `# Numeric
print(int("42"))          # 42
print(int("0xFF", 16))    # 255
print(int("0b1010", 2))   # 10
print(int(3.9))           # 3  (truncates!)
print(round(3.9))         # 4

# String conversion
x = [1, 2, 3]
print(str(x))             # '[1, 2, 3]'
print(repr("hi\n"))       # "'hi\\n'"  (unambiguous)

# Container conversions
print(list("hello"))      # ['h','e','l','l','o']
print(set([1,2,2,3]))     # {1, 2, 3}
print(dict(a=1, b=2))     # {'a':1,'b':2}
print(tuple([1,2,3]))     # (1, 2, 3)

# Bytes / encoding
b = "hello".encode("utf-8")  # bytes
s = b.decode("utf-8")        # str
print(chr(65), ord('A'))     # 'A' 65`
},

"strings::creation & formatting": {
  summary: "Python strings are immutable Unicode sequences. f-strings (PEP 498, Python 3.6+) are the fastest and most readable way to interpolate values. Python 3.12 (PEP 701) lifted historic f-string restrictions: backslashes, same-quote strings, and multi-line expressions are now allowed inside <code>{}</code>. The format spec mini-language controls width, precision, alignment, and numeric formatting. <code>f'{x=}'</code> (Python 3.8+) prints both name and value — invaluable for debugging.",
  when_to_use: "Use f-strings for all new string interpolation. Use <code>str.format_map(mapping)</code> for template-based formatting from a dict. Use <code>textwrap.dedent()</code> with triple-quoted strings to strip leading indentation. Use <code>string.Template</code> for user-facing templates (safe: no arbitrary expressions).",
  gotchas: ["f-strings are evaluated eagerly at creation time — not lazy templates", "Before Python 3.12 (PEP 701), backslashes and same-quote strings were not allowed inside f-string expressions. On 3.11 and earlier, extract to a variable first"],
  example: `name = "Alice"; score = 98.567; n = 1_000_000
# f-string — modern standard
print(f"Hello {name}, score: {score:.2f}")
print(f"{n:,}")             # 1,000,000
print(f"{255:#010x}")       # 0x000000ff
print(f"{'left':<10}|")    # left align

# Debug shorthand (3.8+)
x = [1, 2, 3]
print(f"{x=}")              # x=[1, 2, 3]
print(f"{len(x)=}")         # len(x)=3

# Python 3.12+ (PEP 701) — backslashes and same quotes now allowed
data = {"key": "val"}
print(f"{data['key']}")     # same quotes OK in 3.12+

# Format spec
print(f"{3.14159:.2f}")     # 3.14
print(f"{0.001:.2e}")       # 1.00e-03
print(f"{True!s}")          # True`
},

"strings::methods": {
  summary: "Python strings have a rich set of built-in methods (all return new strings — strings are immutable). Key groups: case (<code>upper</code>, <code>lower</code>, <code>title</code>, <code>casefold</code>), search (<code>find</code>, <code>index</code>, <code>startswith</code>, <code>endswith</code>, <code>count</code>), transform (<code>replace</code>, <code>strip</code>, <code>split</code>, <code>join</code>, <code>splitlines</code>), split-once (<code>partition</code> / <code>rpartition</code>). <code>casefold()</code> is a more aggressive lowercase suitable for case-insensitive comparisons (e.g. German <code>ß</code> → <code>ss</code>). <code>partition(sep)</code> always returns a 3-tuple <code>(before, sep, after)</code> — even on no-match, where sep and after are empty strings. <code>splitlines()</code> handles all Unicode line endings (<code>\n</code>, <code>\r\n</code>, <code>\r</code>, <code>\x0b</code>, etc.) — more correct than <code>split('\n')</code> for cross-platform text.",
  when_to_use: "Use <code>'sep'.join(list)</code> for concatenation in loops — it's O(n) total vs O(n²) for <code>+=</code>. Use <code>str.partition(sep)</code> to split exactly once into (before, sep, after). Use <code>str.translate()</code> with <code>str.maketrans()</code> for bulk single-char replacement.",
  gotchas: ["<code>lstrip(chars)</code> treats its argument as a <strong>set of characters</strong> to remove, not a prefix string — <code>'test_foo'.lstrip('test_')</code> removes all t/e/s/t/_ chars, not just the prefix <code>'test_'</code>. Use <code>removeprefix()</code> for exact prefix removal", "<code>str.split()</code> with no args splits on any whitespace and removes empty strings; <code>str.split(' ')</code> with a space preserves empty strings between consecutive spaces", "<code>casefold()</code> is stronger than <code>lower()</code> for Unicode case-insensitive comparison — prefer it for comparing user input"],
  example: `s = "  Hello, World!  "
print(s.strip())               # "Hello, World!"
print("ß".casefold())          # "ss"  (stronger than lower)
print("hello WORLD".casefold() == "HELLO world".casefold())  # True

# split vs splitlines
text = "line1\r\nline2\nline3\rline4"
print(text.splitlines())       # ["line1","line2","line3","line4"]
print(text.split("\n"))       # ["line1\r","line2","line3\rline4"] (wrong!)

# partition — always returns 3-tuple
print("user@example.com".partition("@"))  # ("user", "@", "example.com")
print("no-at-sign".partition("@"))        # ("no-at-sign", "", "")

# lstrip vs removeprefix — VERY different!
path = "test_something"
print(path.lstrip("test_"))    # "omething"  (removes chars, not prefix!)
print(path.removeprefix("test_"))  # "something"  (correct)

# join, count, replace
print(",".join(["a","b","c"]))  # "a,b,c"
print("spam eggs spam".count("spam"))  # 2
print("hello".replace("l","r"))  # "herro"`
},

"lists::core operations": {
  summary: "Lists are mutable, ordered sequences: O(1) index access and <code>append</code>; O(n) <code>insert</code>/<code>remove</code>/<code>pop(i)</code>. <code>list.sort()</code> and <code>sorted()</code> use <strong>Powersort</strong> (Python 3.11+, replaced Timsort) — a stable, adaptive merge sort. Stable means equal elements keep their original relative order. The <code>key=</code> parameter takes a function applied to each element for comparison purposes only — the original elements are returned in sorted order, not the key values. <code>*</code> unpacking in assignments and literals; extended unpacking with <code>*rest</code>.",
  when_to_use: "Use <code>list.sort()</code> (in-place) vs <code>sorted()</code> (new list). Use <code>deque</code> for queues — <code>list.pop(0)</code> is O(n). Use <code>bisect</code> for binary search and insertion into sorted lists. Use <code>*</code> unpacking in literals to merge lists.",
  gotchas: ["<code>[[]] * n</code> creates n references to the same inner list — use <code>[[] for _ in range(n)]</code>", "<code>list.sort()</code> mutates in place and returns <code>None</code>; <code>sorted()</code> returns a new list — assigning <code>lst = lst.sort()</code> sets lst to None", "Python 3.11+ uses Powersort (not Timsort) — but stability is still guaranteed by the language spec, not just CPython"],
  example: `nums = [3, 1, 4, 1, 5, 9, 2, 6]

# Sort — stable Timsort
nums.sort()                       # in-place
print(sorted(nums, reverse=True)) # new list

# Custom sort key
people = [("Bob",30),("Alice",25),("Carol",30)]
people.sort(key=lambda x: (x[1], x[0]))  # age then name

# Stack (LIFO)
stack = []; stack.append(1); stack.append(2)
print(stack.pop())                # 2

# Extended unpacking
first, *rest       = [1,2,3,4,5]
*init, last        = [1,2,3,4,5]
a, *mid, z         = [1,2,3,4,5]
print(first, rest)                # 1 [2,3,4,5]

# Merge with *
merged = [*[1,2], *[3,4], 5]    # [1,2,3,4,5]

# Correct 2D list
matrix = [[0]*3 for _ in range(3)]  # independent rows!
matrix[0][0] = 99
print(matrix[1][0])               # 0 (not 99)`
},

"tuples::tuple essentials": {
  summary: "Tuples are immutable, ordered sequences. Immutability makes them hashable (usable as dict keys / set elements). Slightly faster to create and iterate than lists. Key use: return multiple values, heterogeneous fixed-structure records, dict keys. <code>typing.NamedTuple</code> adds field names and type hints. <code>collections.namedtuple</code> is the older alternative.",
  when_to_use: "Use tuples for heterogeneous fixed-structure data (like a DB row). Use as dict keys for compound keys: <code>{(x, y): value}</code>. Return multiple values as tuples from functions. Use <code>typing.NamedTuple</code> for structured named records — it's self-documenting.",
  gotchas: ["Single-element tuple requires trailing comma: <code>(42,)</code> not <code>(42)</code>. <code>(42)</code> is just the integer in parentheses", "Tuples are immutable but mutable objects inside can still be mutated: <code>t = ([1,2],); t[0].append(3)</code> works"],
  example: `# Creation
point   = (3, 4)
single  = (42,)              # trailing comma required!
packed  = 1, 2, 3            # parens optional

# Unpacking
x, y   = point
a, *rest = (1, 2, 3, 4)

# As dict key
grid = {(0,0):"origin", (1,0):"right"}

# namedtuple
from collections import namedtuple
Point = namedtuple("Point", ["x","y"])
p = Point(3, 4)
print(p.x, p._asdict())      # 3  OrderedDict...

# Typed NamedTuple (preferred for new code)
from typing import NamedTuple
class Vector(NamedTuple):
    x: float
    y: float
    label: str = "v"

v = Vector(1.0, 2.0)
print(v.x, v.label)          # 1.0 v
print(v._replace(x=5.0))     # Vector(x=5.0, y=2.0, label='v')`
},

"sets & frozensets::set operations": {
  summary: "<code>set</code> is an unordered, mutable collection of unique hashable objects backed by a hash table. Average O(1) for add, remove, and <code>in</code>. Supports math set ops: union <code>|</code>, intersection <code>&</code>, difference <code>-</code>, symmetric difference <code>^</code>. <code>issubset()</code>/<code>issuperset()</code> (or <code><=</code>/<code>>=</code>); <code>isdisjoint(other)</code> returns <code>True</code> if no elements in common — faster than <code>len(a & b) == 0</code> because it short-circuits. <code>frozenset</code> is the immutable, hashable version — usable as dict key or set element.",
  when_to_use: "Use sets for fast membership testing (O(1) vs O(n) for lists). Use for deduplication. Use for set arithmetic (intersection, difference). Use <code>frozenset</code> when you need a hashable set.",
  gotchas: ["<code>{}</code> creates an empty <code>dict</code>, NOT an empty <code>set</code>. Use <code>set()</code> for empty sets", "Sets are unordered — don't rely on iteration order. For ordered uniqueness, use <code>dict.fromkeys(items)</code> (preserves insertion order in Python 3.7+)"],
  example: `a = {1,2,3,4}; b = {3,4,5,6}
empty = set()               # NOT {}
print(a | b)                # {1,2,3,4,5,6}
print(a & b)                # {3,4}
print(a - b)                # {1,2}
print(a ^ b)                # {1,2,5,6}
print({1,2} <= {1,2,3})    # True (subset)
print(a.isdisjoint({7,8})) # True (no common elements, short-circuits)
print(a.isdisjoint({4,7})) # False

# Fast O(1) membership
valid = {101, 202, 303}
print(202 in valid)         # True

# Order-preserving dedup
nums = [3,1,2,1,3]
unique = list(dict.fromkeys(nums))  # [3,1,2]

# frozenset as dict key
color_map = {frozenset({"red","blue"}): "purple"}

# Set comprehension
squares = {x**2 for x in range(10)}`
},

"dictionaries::creation & access": {
  summary: "Dicts are mutable mappings with average O(1) get/set/delete. Python 3.7+ guarantees insertion-order preservation. Creation: literals <code>{}</code>, <code>dict()</code>, comprehensions, <code>dict.fromkeys()</code>. Merge operator <code>|</code> (Python 3.9+) creates a new merged dict (right side wins on conflict). Update operator <code>|=</code> (Python 3.9+) merges in-place. <code>dict.get(key, default)</code> avoids <code>KeyError</code>. <code>dict.setdefault(key, default)</code> initialises missing keys in-place. Dict views (<code>keys()</code>, <code>values()</code>, <code>items()</code>) are live windows and support set-like operations.",
  when_to_use: "Use <code>dict.get()</code> when a missing key is expected and not an error. Use <code>dict.setdefault()</code> to initialise accumulator patterns. Use <code>collections.defaultdict</code> for auto-initialised missing keys. Use the <code>|</code> operator (Python 3.9+) or <code>{**d1, **d2}</code> to merge dicts.",
  gotchas: ["Dict keys must be hashable — lists and dicts cannot be keys", "Mutating a dict while iterating it raises <code>RuntimeError</code> — iterate over <code>list(d.items())</code> if you need to delete during iteration"],
  example: `d = {"name":"Alice","age":30}
print(d.get("missing","N/A"))     # "N/A"

# Merge (|) — new dict, right side wins
defaults  = {"color":"blue","size":10}
overrides = {"color":"red"}
merged = defaults | overrides      # {"color":"red","size":10}

# Update (|=) — in-place, Python 3.9+
config = {"debug":False,"log":"INFO"}
config |= {"log":"DEBUG","workers":4}  # mutates config

# Dict comprehension
squares = {x: x**2 for x in range(5)}

# setdefault — init accumulator in place
groups = {}
for name, dept in [("Alice","Eng"),("Bob","HR"),("Carol","Eng")]:
    groups.setdefault(dept, []).append(name)

# Unpack into function
def greet(name, age): return f"{name}/{age}"
print(greet(**d))

# Iterate
for k, v in d.items(): print(k, v)`
},

"dictionaries::advanced patterns": {
  summary: "<code>collections.defaultdict</code> auto-creates values via a factory. <code>Counter</code> counts hashable objects, supports arithmetic (+, -, &, |) and <code>most_common(n)</code>. <code>ChainMap</code> layers multiple dicts without merging. Dict views (<code>keys()</code>, <code>values()</code>, <code>items()</code>) are live dynamic windows — changes to the dict are immediately reflected. <code>dict.keys()</code> and <code>dict.items()</code> support set-like operations: <code>d1.keys() & d2.keys()</code> finds common keys; <code>d1.keys() - d2.keys()</code> finds keys only in d1.",
  when_to_use: "Use <code>Counter</code> for any frequency-counting task — its arithmetic operators combine counts cleanly. Use <code>defaultdict(list)</code> for grouping. Use <code>ChainMap</code> for configuration layering (user overrides > env > defaults) without copying.",
  gotchas: ["<code>Counter</code> returns 0 for missing keys — it won't raise <code>KeyError</code>. This is convenient but can mask typos in key names", "<code>dict.items()</code>, <code>.keys()</code>, <code>.values()</code> return view objects that reflect current state — wrap in <code>list()</code> for a snapshot"],
  example: `from collections import defaultdict, Counter, ChainMap

# defaultdict
groups = defaultdict(list)
for name, dept in [("Alice","Eng"),("Bob","Eng"),("Carol","HR")]:
    groups[dept].append(name)

# Counter
c = Counter("aaabbc")
print(c.most_common(2))   # [("a",3),("b",2)]
c2 = Counter("abcd")
print(c + c2)             # combined
print(c & c2)             # intersection (min counts)

# Dict view set operations
d1 = {"a":1,"b":2,"c":3}
d2 = {"b":20,"c":30,"d":40}
print(d1.keys() & d2.keys())    # {"b","c"}  common keys
print(d1.keys() - d2.keys())    # {"a"}      only in d1
print(d1.keys() | d2.keys())    # all keys
# items() view also supports set ops (if values are hashable)
print(d1.items() & d2.items())  # set() — no matching key+value pairs

# ChainMap
cfg = ChainMap({"log":"DEBUG"}, {"log":"INFO","workers":4})
print(cfg["log"])     # "DEBUG" (first map wins)
print(cfg["workers"]) # 4`
},

"control flow::conditionals, loops & match": {
  summary: "<code>if/elif/else</code>, <code>for</code>, <code>while</code>, <code>break</code>, <code>continue</code>, loop <code>else</code> (runs if no <code>break</code>). Python 3.10+ adds structural pattern matching with <code>match/case</code>. <code>range</code> is a full sequence type, not just a loop construct: it supports <code>in</code> (O(1) membership test — not a scan), slicing, <code>len()</code>, <code>index()</code>, and <code>count()</code>. <code>enumerate()</code> and <code>zip()</code> are the idiomatic loop helpers. <code>zip(strict=True)</code> (Python 3.10+) raises <code>ValueError</code> if iterables have different lengths — use this when they should be the same length.",
  when_to_use: "Use <code>for/else</code> to detect 'completed without finding anything' without a flag variable. Use <code>enumerate(start=1)</code> instead of manual counters. Use <code>zip(strict=True)</code> (Python 3.10+) to catch length mismatches. Use <code>match/case</code> for complex structural dispatch instead of isinstance chains.",
  gotchas: ["The loop <code>else</code> clause runs when the loop finishes WITHOUT a <code>break</code> — many developers find this confusing; add a comment", "Mutating a list during <code>for x in lst:</code> can skip elements — iterate over <code>lst[:]</code> or collect mutations separately"],
  example: `# for/else — no break = found nothing
def first_prime(lst):
    for n in lst:
        for i in range(2, int(n**0.5)+1):
            if n % i == 0: break
        else: return n  # no break = prime

# range is a full sequence type
r = range(0, 100, 2)
print(50 in r)         # True — O(1), not a scan!
print(r[5])            # 10
print(r[::3])          # range(0, 100, 6)
print(len(r))          # 50

# zip(strict=True) — catch length mismatches (Python 3.10+)
names  = ["Alice","Bob","Carol"]
scores = [95, 87, 92]
for n, s in zip(names, scores, strict=True): print(n, s)
# zip(names, scores[:2], strict=True)  → ValueError

# match/case (Python 3.10+)
match status:
    case 200: return "OK"
    case 404: return "Not Found"
    case {"type": "click", "x": x, "y": y}: print(f"click {x},{y}")
    case _:   return "Other"`
},

"functions::arguments & defaults": {
  summary: "Python supports 5 parameter types: positional, <code>*args</code>, keyword-only (after bare <code>*</code>), <code>**kwargs</code>, positional-only (before <code>/</code>, Python 3.8+). Default values are evaluated once at definition — mutable defaults are a classic bug. Closures capture variables by reference. <code>functools.partial</code> creates partially-applied functions.",
  when_to_use: "Use bare <code>*</code> to force keyword-only arguments. Use <code>/</code> to make parameters positional-only. Use <code>nonlocal</code> to rebind (not just mutate) enclosing scope variables. Use <code>operator.itemgetter</code>/<code>attrgetter</code> as faster, cleaner alternatives to lambdas in sort keys.",
  gotchas: ["Mutable default argument bug: <code>def f(lst=[])</code> — all calls share the same list. Fix: <code>def f(lst=None): lst = lst or []</code>", "Loop closure bug: lambdas in a loop all capture the same variable. Fix: use default arg <code>lambda x, i=i: x*i</code>"],
  example: `from functools import partial
from operator import itemgetter

# Positional-only (/) and keyword-only (*) params
def create_user(name, age, /, *, role="user", active=True):
    return {"name": name, "age": age, "role": role}

create_user("Alice", 30, role="admin")  # OK
# create_user(name="Alice", age=30)     # TypeError!

# Mutable default — WRONG vs RIGHT
def bad(lst=[]):   lst.append(1); return lst
def good(lst=None): lst = [] if lst is None else lst; lst.append(1); return lst

# Closure factory
def make_multiplier(n):
    def multiply(x): return x * n   # captures n
    return multiply

triple = make_multiplier(3)
print(triple(7))              # 21

# Loop closure fix
fns = [lambda x, i=i: x * i for i in range(4)]
print([f(10) for f in fns])   # [0,10,20,30]

# partial application
def power(base, exp): return base ** exp
square = partial(power, exp=2)
print(square(5))              # 25

# Higher-order sort
people = [{"name":"Bob","age":30},{"name":"Alice","age":25}]
print(sorted(people, key=itemgetter("age")))`
},

"comprehensions & generators::list, dict & set comprehensions": {
  summary: "Comprehensions create containers concisely. List: <code>[expr for x in it if cond]</code>. Dict: <code>{k:v for ...}</code>. Set: <code>{expr for ...}</code>. Generator: <code>(expr for ...)</code> — lazy, O(1) memory, single-use. Multiple <code>for</code> clauses nest like nested loops. <code>yield from</code> delegates to a sub-generator.",
  when_to_use: "Use comprehensions for simple transforms/filters. Use generator expressions when iterating once over large data — no list built in memory. Pass generator expressions directly to aggregation functions: <code>sum(x**2 for x in range(n))</code>. Avoid deeply nested comprehensions — extract to functions.",
  gotchas: ["Variables in comprehensions do NOT leak into the enclosing scope in Python 3 (changed from Python 2)", "Generators are single-use — once exhausted they yield nothing. Call the generator function again for a fresh one"],
  example: `# List comprehensions
squares = [x**2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]
flat    = [x for row in [[1,2],[3,4]] for x in row]

# Dict and set comprehensions
word_len  = {w: len(w) for w in ["hello","world"]}
unique_ln = {len(w) for w in ["hi","hey","hello"]}

# Generator expression — lazy O(1) memory
total = sum(x**2 for x in range(1_000_000))  # no list built

# Generator function
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
first10 = [next(fib) for _ in range(10)]

# yield from (delegate to sub-generator)
def chain(*iters):
    for it in iters:
        yield from it

print(list(chain([1,2],[3,4],[5,6])))  # [1,2,3,4,5,6]

# Conditional expression in comprehension
labels = ["pos" if x>0 else "neg" if x<0 else "zero"
          for x in [-1,0,1,2]]`
},

"error handling::try / except / finally": {
  summary: "<code>try/except/else/finally</code>: <code>else</code> runs only if no exception was raised; <code>finally</code> always runs. Catch the most specific exception type. Use <code>raise X from Y</code> for exception chaining. Python 3.11+ (PEP 654) adds <code>ExceptionGroup</code> and <code>except*</code> for handling multiple concurrent exceptions — the primary use case is <code>asyncio.TaskGroup</code>, which raises an <code>ExceptionGroup</code> when tasks fail. Python 3.11+ also adds <code>exception.add_note()</code> to attach extra context to exceptions.",
  when_to_use: "Use <code>else</code> to distinguish 'code that may raise' from 'code that runs on success'. Use <code>finally</code> for releasing resources. Use <code>contextlib.suppress(ExcType)</code} to silently ignore specific exceptions. Create exception hierarchies so callers can catch broadly or narrowly.",
  gotchas: ["Re-raise with bare <code>raise</code>, not <code>raise e</code> — bare raise preserves the original traceback", "Catching bare <code>Exception</code> is usually fine; never catch bare <code>BaseException</code> (it would swallow <code>KeyboardInterrupt</code>)"],
  example: `from contextlib import suppress

def read_cfg(path):
    try:
        with open(path) as f: data = f.read()
    except FileNotFoundError:
        return {}
    except PermissionError as e:
        raise RuntimeError(f"Cannot read {path}") from e
    else:
        import json; return json.loads(data)
    finally:
        print("config read attempted")

# ExceptionGroup + except* (Python 3.11+, PEP 654)
# asyncio.TaskGroup raises ExceptionGroup when tasks fail
try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(might_fail_a())
        tg.create_task(might_fail_b())
except* ValueError as eg:
    for exc in eg.exceptions: print(f"ValueError: {exc}")
except* TypeError as eg:
    print(f"{len(eg.exceptions)} TypeErrors")

# add_note (Python 3.11+)
try:
    raise ValueError("bad input")
except ValueError as e:
    e.add_note("Hint: must be positive integer"); raise

# suppress
with suppress(FileNotFoundError):
    import os; os.remove("tmp.txt")`
},

"file i/o & context managers": {
  summary: "Always use <code>with open()</code> — it ensures the file closes even on exceptions. Mode strings: <code>'r'</code> read text, <code>'w'</code> write (truncate), <code>'a'</code> append, <code>'b'</code> binary, <code>'+'</code> read+write. Always specify <code>encoding='utf-8'</code> for text files. Context managers use <code>__enter__</code>/<code>__exit__</code>. Use <code>@contextmanager</code> for simple generator-based CMs.",
  when_to_use: "Iterate the file object line-by-line for large files — avoids loading into memory. Use <code>pathlib.Path.read_text()</code>/<code>write_text()</code> for small files. Use <code>contextlib.ExitStack</code> when the number of context managers is dynamic. Use <code>io.StringIO</code>/<code>BytesIO</code> as in-memory file objects for testing.",
  gotchas: ["Omitting <code>encoding=</code> uses the system default — on Windows this is often <code>cp1252</code>, causing <code>UnicodeDecodeError</code> on UTF-8 files", "If <code>__exit__</code> returns a truthy value, the exception is suppressed — rarely what you want"],
  example: `from pathlib import Path
from contextlib import contextmanager
import time

# File I/O
with open("data.txt", "w", encoding="utf-8") as f:
    f.write("Hello\n")
    print("World", file=f)     # print adds newline

# Line-by-line (memory-efficient)
with open("large.log", encoding="utf-8") as f:
    for line in f:             # file is an iterator
        process(line.rstrip("\n"))

# Pathlib convenience
p = Path("config.json")
text = p.read_text(encoding="utf-8")
p.write_text('{"key":"val"}', encoding="utf-8")

# Generator-based context manager
@contextmanager
def timer(label="elapsed"):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter()-start:.3f}s")

with timer("sort"):
    sorted(range(100_000), reverse=True)

# Dynamic context managers
from contextlib import ExitStack
with ExitStack() as stack:
    files = [stack.enter_context(open(f)) for f in ["a.txt","b.txt"]]`
},

"builtins & operators": {
  summary: "Key built-ins: <code>len</code>, <code>range</code>, <code>enumerate</code>, <code>zip</code>, <code>map</code>, <code>filter</code>, <code>sorted</code>, <code>reversed</code>, <code>sum</code>, <code>min</code>/<code>max</code>, <code>abs</code>, <code>round</code>, <code>any</code>/<code>all</code>, <code>isinstance</code>, <code>getattr</code>/<code>setattr</code>/<code>hasattr</code>, <code>vars</code>, <code>dir</code>, <code>id</code>, <code>type</code>, <code>callable</code>. Walrus operator <code>:=</code> assigns in expressions (Python 3.8+).",
  when_to_use: "Use <code>isinstance(x, (TypeA, TypeB))</code> for multi-type checks. Use <code>any()</code>/<code>all()</code> with generators for short-circuit evaluation. Use <code>getattr(obj, name, default)</code> for safe dynamic attribute access. Use chained comparisons <code>0 < x < 10</code> (unique to Python).",
  gotchas: ["<code>zip()</code> stops at the shortest iterable — use <code>itertools.zip_longest()</code> for all elements", "Walrus <code>:=</code> needs parentheses when used as a standalone expression in <code>if</code> — e.g. <code>if (n := len(a)) > 10:</code>"],
  example: `import itertools

# any/all with generators (short-circuits)
nums = [1, 2, 3, 4, 5]
print(any(x > 4 for x in nums))   # True (stops at 5)
print(all(x > 0 for x in nums))   # True

# zip vs zip_longest
a, b = [1,2,3], [10,20]
print(list(zip(a, b)))             # [(1,10),(2,20)]
print(list(itertools.zip_longest(a,b,fillvalue=0))) # [(1,10),(2,20),(3,0)]

# getattr for dynamic dispatch
class Processor:
    def process_csv(self, d): return f"csv:{d}"
    def process_json(self, d): return f"json:{d}"

p = Processor()
fmt = "csv"
result = getattr(p, f"process_{fmt}", lambda d: d)("data")

# Chained comparisons (Pythonic)
x = 5
print(0 < x < 10)               # True

# Walrus operator
import re
text = "Error on line 42"
if m := re.search(r"line (\d+)", text):
    print(f"Line: {m.group(1)}")  # Line: 42

# vars() — instance dict
class Point:
    def __init__(self, x, y): self.x = x; self.y = y
print(vars(Point(1, 2)))         # {'x': 1, 'y': 2}`
},

// PAGE 2 — ADVANCED PYTHON

"classes & inheritance::classes, inheritance & properties": {
  summary: "Python classes support single and multiple inheritance, cooperative <code>super()</code>, class/static methods, properties, slots, and ABCs. The Method Resolution Order (MRO) uses C3 linearisation. <code>@property</code> creates managed attributes without changing the calling interface. <code>__slots__</code> replaces the instance <code>__dict__</code> to reduce memory usage on classes with many instances.",
  when_to_use: "Use <code>@property</code> to add computed attributes or validation without changing the public API. Use <code>@classmethod</code> for alternative constructors. Use <code>@staticmethod</code> for utility functions logically belonging to the class. Use <code>__slots__</code> when creating millions of instances.",
  gotchas: ["In multiple inheritance, every class should call <code>super().__init__()</code> for cooperative MRO to work correctly", "Defining <code>__slots__</code> prevents arbitrary attributes — instances can only have the declared attributes"],
  example: `from abc import ABC, abstractmethod
class Animal:
    count = 0   # class variable
    def __init__(self, name: str):
        self.name = name; self._sound = ""; Animal.count += 1
    @property
    def sound(self) -> str: return self._sound
    @sound.setter
    def sound(self, v: str):
        if not v: raise ValueError("Sound cannot be empty")
        self._sound = v.lower()
    @classmethod
    def from_dict(cls, d: dict) -> "Animal":
        a = cls(d["name"]); a.sound = d["sound"]; return a
    @staticmethod
    def valid_name(name: str) -> bool:
        return bool(name and name[0].isupper())
    def __repr__(self): return f"{type(self).__name__}({self.name!r})"
class Dog(Animal):
    def __init__(self, name: str, breed: str):
        super().__init__(name); self.breed = breed; self.sound = "woof"
    def speak(self) -> str: return f"{self.name}: {self.sound}!"
d = Dog("Rex","Lab")
print(d.speak())        # Rex: woof!
print(Animal.count)     # 1`
},

"protocols & abstract classes::protocols & abstract classes": {
  summary: "Abstract base classes (<code>abc.ABC</code> + <code>@abstractmethod</code>) enforce interface contracts at instantiation time. Protocols (<code>typing.Protocol</code>, Python 3.8+) enable structural subtyping — a class satisfies a Protocol by having the right methods without inheriting from it. <code>@runtime_checkable</code> allows <code>isinstance()</code> checks at runtime.",
  when_to_use: "Use ABC for explicit inheritance hierarchies where you own all implementing classes. Use Protocol for duck-typed interfaces and third-party code. Protocols are preferred in modern Python for type safety without tight coupling.",
  gotchas: ["<code>isinstance(obj, MyProtocol)</code> only works if the Protocol is decorated <code>@runtime_checkable</code>", "ABCs raise <code>TypeError</code> at instantiation (not class definition) if abstract methods are not overridden"],
  example: `from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...
    @abstractmethod
    def perimeter(self) -> float: ...
    def describe(self) -> str: return f"area={self.area():.2f}"
class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self):      return 3.14159 * self.r**2
    def perimeter(self): return 2 * 3.14159 * self.r
@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...
class Button:
    def draw(self): print("button")
def render_all(items: list[Drawable]):
    for item in items: item.draw()
render_all([Button()])
print(isinstance(Button(), Drawable))  # True`
},

"dunder methods::core dunders": {
  summary: "Special methods define how objects behave with Python built-in operations. <code>__repr__</code> for unambiguous repr (ideally eval-able). <code>__str__</code> for user-friendly string. <code>__len__</code>, <code>__getitem__</code> / <code>__setitem__</code> / <code>__delitem__</code> for sequences/mappings. <code>__iter__</code> / <code>__next__</code> for iteration. <code>__call__</code> for callable objects. <code>__eq__</code> / <code>__hash__</code> for equality and hashing. <code>functools.total_ordering</code> derives comparison methods from <code>__eq__</code> + one comparison.",
  when_to_use: "Implement <code>__repr__</code> for all non-trivial classes. If you define <code>__eq__</code>, also define <code>__hash__</code> (or set to <code>None</code> to make unhashable). Use <code>total_ordering</code> to avoid implementing all 6 comparison methods manually.",
  gotchas: ["Defining <code>__eq__</code> implicitly sets <code>__hash__ = None</code> — explicitly define <code>__hash__</code> if instances need to be in sets or as dict keys", "If only <code>__repr__</code> is defined, Python uses it for <code>str(obj)</code> too"],
  example: `from functools import total_ordering
@total_ordering
class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount = round(amount, 2); self.currency = currency
    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"
    def __str__(self):
        return f"{self.currency} {self.amount:.2f}"
    def __add__(self, other):
        if self.currency != other.currency: raise ValueError
        return Money(self.amount + other.amount, self.currency)
    def __eq__(self, other):
        return isinstance(other, Money) and self.amount == other.amount
    def __lt__(self, other):
        return self.amount < other.amount
    def __hash__(self):    # needed because we defined __eq__
        return hash((self.amount, self.currency))
a, b = Money(10.50), Money(5.25)
print(a + b)   # USD 15.75
print(a > b)   # True (total_ordering)
prices = {a, b}`
},

"decorators::function & parametrised": {
  summary: "A decorator is a callable that wraps a function. Always use <code>@functools.wraps(func)</code> inside to preserve <code>__name__</code>, <code>__doc__</code>. Parametrised decorators require three levels: factory→decorator→wrapper. Decorators are applied bottom-up at definition time — they run when the module is imported.",
  when_to_use: "Use decorators for cross-cutting concerns: logging, timing, retrying, caching, auth checks. Use <code>@functools.lru_cache</code> / <code>@functools.cache</code> (Python 3.9+) for memoisation. Compose decorators by stacking.",
  gotchas: ["Forgetting <code>@wraps(func)</code> breaks introspection — <code>decorated_func.__name__</code> returns the wrapper name", "Stacked decorators apply bottom-up: the decorator closest to the function runs first"],
  example: `import functools, time
def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        return result
    return wrapper

def retry(max_attempts=3, delay=1.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1: raise
                    time.sleep(delay * (2 ** attempt))
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5, exceptions=(ConnectionError,))
@log_calls
def fetch(url: str) -> str:
    import urllib.request
    return urllib.request.urlopen(url).read().decode()

# functools builtins
@functools.lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)
print(fib(50), fib.cache_info())`
},

"generators & iterators::full iterator protocol": {
  summary: "The iterator protocol: <code>__iter__</code> returns self, <code>__next__</code> returns next value or raises <code>StopIteration</code>. An iterable implements only <code>__iter__</code> (returns a fresh iterator each call). Generator functions simplify this with <code>yield</code>. Generators support <code>send(value)</code> for coroutine-style communication. <code>yield from</code> delegates to sub-generators and propagates <code>send()</code> / <code>throw()</code>.",
  when_to_use: "Use generator functions instead of iterator classes. Use <code>yield from</code> to delegate and propagate signals. Use <code>itertools.islice(gen, n)</code> to take limited items from infinite generators.",
  gotchas: ["<code>StopIteration</code> raised inside a generator becomes <code>RuntimeError</code> in Python 3.7+ (PEP 479) — use <code>return</code> to end a generator", "Generators are single-use — once exhausted they yield nothing. Call the function again for a fresh generator"],
  example: `# Infinite generator with islice
from itertools import islice
def integers(n=0):
    while True: yield n; n += 1
print(list(islice(integers(10), 5)))   # [10,11,12,13,14]

# send() coroutine
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None: break
        total += value
acc = accumulator()
next(acc)              # prime
acc.send(10)           # 10
acc.send(20)           # 30
print(acc.send(5))     # 35

# yield from — delegate + propagate
def flatten(nested):
    for item in nested:
        if isinstance(item, list): yield from flatten(item)
        else: yield item
print(list(flatten([1,[2,[3,4]],5])))  # [1,2,3,4,5]

# Generator pipeline
def read_lines(path):
    with open(path) as f: yield from f
def grep(pattern, lines):
    import re
    return (l for l in lines if re.search(pattern, l))`
},

"async / await::asyncio": {
  summary: "<code>asyncio</code> implements cooperative multitasking via an event loop. <code>async def</code> defines coroutines. <code>await</code> suspends until the awaitable completes. <code>asyncio.TaskGroup</code> (Python 3.11+) is the modern structured-concurrency primitive: it cancels all tasks if any fails and raises an <code>ExceptionGroup</code>. <code>asyncio.gather()</code> still works but is soft-deprecated in 3.13 in favour of <code>TaskGroup</code>. <code>asyncio.timeout()</code> added in Python 3.11. Critical: <code>TaskGroup</code> and <code>timeout()</code> use cancellation internally — never swallow <code>CancelledError</code> inside a task group.",
  when_to_use: "Use asyncio for I/O-bound concurrency. Use <code>asyncio.gather()</code> for concurrent independent tasks. Use <code>asyncio.Semaphore</code> to throttle concurrent operations. Use <code>TaskGroup</code> (Python 3.11+) for structured concurrency with automatic cancellation on error.",
  gotchas: ["Calling blocking functions (<code>time.sleep</code>, <code>requests.get</code>) inside async code blocks the entire event loop — use <code>await asyncio.sleep()</code> and aiohttp", "Never swallow <code>asyncio.CancelledError</code> inside a TaskGroup — structured cancellation depends on it propagating correctly", "<code>asyncio.gather()</code> is soft-deprecated in 3.13 — use <code>TaskGroup</code> for new structured-concurrency code"],
  example: `import asyncio

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name}: done"

# TaskGroup (Python 3.11+) — preferred, structured concurrency
# Cancels all tasks on failure; raises ExceptionGroup
async def with_taskgroup():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch("A", 1.0))
        t2 = tg.create_task(fetch("B", 0.5))
    return [t1.result(), t2.result()]

# gather() — still works, soft-deprecated in 3.13
async def with_gather():
    return await asyncio.gather(
        fetch("A", 1.0), fetch("B", 0.5),
        return_exceptions=True)

# asyncio.timeout() (Python 3.11+)
async def with_timeout():
    try:
        async with asyncio.timeout(5.0):
            return await slow_op()
    except TimeoutError:
        return None

# Semaphore — limit concurrent operations
async def fetch_all(urls):
    sem = asyncio.Semaphore(10)
    async def one(url):
        async with sem: return await do_fetch(url)
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(one(u)) for u in urls]
    return [t.result() for t in tasks]

asyncio.run(with_taskgroup())`
},

"type hints::typing module": {
  summary: "Type hints (PEP 484) annotate code for static analysis by mypy/pyright. Python 3.9+: built-in generics <code>list[int]</code>. Python 3.10+: <code>X | Y</code> union syntax. Python 3.12 (PEP 695): new <code>type</code> alias statement and <code>class Foo[T]:</code> generic class syntax. Python 3.13 (PEP 696): <code>TypeVar</code> now supports <code>default=</code>. Python 3.13 (PEP 702): <code>@warnings.deprecated()</code> marks deprecations in the type system and at runtime. Python 3.13 (PEP 705): <code>typing.ReadOnly</code> marks <code>TypedDict</code> items read-only. Python 3.13 (PEP 742): <code>TypeIs</code> is a more intuitive alternative to <code>TypeGuard</code> for type narrowing. Not enforced at runtime — use Pydantic or beartype for that.",
  when_to_use: "Add <code>from __future__ import annotations</code> for forward references. Use <code>TypeVar</code> for generic functions. Use <code>ParamSpec</code> for type-safe decorator signatures. Use <code>TYPE_CHECKING</code> block to avoid circular imports at runtime.",
  gotchas: ["Type hints are NOT enforced at runtime — use pydantic or <code>beartype</code> for runtime validation", "Circular imports: use <code>from __future__ import annotations</code> or <code>if TYPE_CHECKING: from x import Y</code>"],
  example: `from __future__ import annotations
from typing import TypeVar, Callable, Literal, TypedDict, TypeIs
from typing import ReadOnly   # Python 3.13+
import warnings, functools

# Python 3.12+ — type alias + generic syntax (PEP 695)
type Vector = list[float]         # new type statement

class Stack[T]:                   # generic class (PEP 695)
    def __init__(self) -> None: self._items: list[T] = []
    def push(self, item: T) -> None: self._items.append(item)
    def pop(self) -> T: return self._items.pop()

# TypeVar with default (Python 3.13+, PEP 696)
T = TypeVar("T", default=int)

# TypedDict with ReadOnly items (Python 3.13+, PEP 705)
class Config(TypedDict):
    host: str
    port: ReadOnly[int]           # type checkers reject mutation

# TypeIs — better narrowing than TypeGuard (Python 3.13+, PEP 742)
def is_str_list(val: list[object]) -> TypeIs[list[str]]:
    return all(isinstance(x, str) for x in val)

# @deprecated (Python 3.13+, PEP 702)
@warnings.deprecated("Use new_func() instead")
def old_func(): pass

# ParamSpec for type-safe decorators
from typing import ParamSpec
P = ParamSpec("P")
def timed(func: Callable[P, T]) -> Callable[P, T]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        import time; s = time.perf_counter()
        r = func(*args, **kwargs)
        print(f"{time.perf_counter()-s:.3f}s"); return r
    return wrapper`
},

"dataclasses::dataclass essentials": {
  summary: "<code>@dataclass</code> (Python 3.7+) auto-generates <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code>. Options: <code>frozen=True</code> (immutable + hashable), <code>order=True</code> (comparison methods), <code>slots=True</code> (Python 3.10+), <code>kw_only=True</code> (Python 3.10+). <code>KW_ONLY</code> sentinel (Python 3.10+) makes all subsequent fields keyword-only. <code>field()</code> customises per-field behaviour. <code>__post_init__</code> runs after <code>__init__</code> for validation. Python 3.13+: <code>copy.replace(obj, **changes)</code> is the new generic replacement function that works on dataclasses, namedtuples, and any class defining <code>__replace__()</code>.",
  when_to_use: "Use <code>@dataclass</code> for DTOs, value objects, and structured data. Use <code>frozen=True</code> for immutable records. Use <code>field(default_factory=list)</code> for mutable defaults. Use <code>InitVar</code> for init-only parameters not stored as fields.",
  gotchas: ["<code>items: list = []</code> raises <code>ValueError</code> — mutable defaults must use <code>field(default_factory=list)</code>", "With <code>frozen=True</code> and inheritance, the parent must also be frozen or have no fields"],
  example: `from dataclasses import dataclass, field, KW_ONLY, replace
from typing import ClassVar
import copy

@dataclass(order=True, slots=True)   # slots=True: Python 3.10+
class Version:
    major: int
    minor: int = 0
    patch: int = 0
    _: KW_ONLY                        # 3.10+: all below are kw-only
    pre: str = field(default="", compare=False)
    _count: ClassVar[int] = 0

    def __post_init__(self):
        if self.major < 0: raise ValueError("major must be >= 0")
    def __str__(self) -> str:
        b = f"{self.major}.{self.minor}.{self.patch}"
        return f"{b}-{self.pre}" if self.pre else b

@dataclass(frozen=True)
class Point:
    x: float; y: float
    tags: tuple = field(default_factory=tuple)

v1 = Version(2, 1, 3)
v2 = Version(3, 0)
print(v1 < v2)                  # True (order=True)

p = Point(1.0, 2.0)
# dataclasses.replace() — all Python versions
p2 = replace(p, x=5.0)          # Point(x=5.0, y=2.0)
# copy.replace() — Python 3.13+ generic version
p3 = copy.replace(p, y=10.0)    # also works on namedtuples
seen = {p, p2, p3}              # hashable (frozen=True)`
},

"memory & performance::profiling & optimisation": {
  summary: "Python memory model: reference counting + cyclic GC. The GIL serialises Python bytecode in the standard build — Python 3.13 (PEP 703) added an opt-in free-threaded build (<code>python3.13t</code>); Python 3.14 (PEP 779) made it officially supported. Python 3.12 (PEP 669) added <code>sys.monitoring</code> as a low-overhead profiling/debugging hook API, replacing <code>sys.settrace</code> for performance-sensitive tools. Profiling tools: <code>cProfile</code> for CPU hotspots, <code>tracemalloc</code> for memory, <code>timeit</code> for microbenchmarks. Optimisations: <code>__slots__</code> reduces per-instance memory, generators avoid materialising large lists, local variable caching avoids repeated attribute lookup.",
  when_to_use: "Profile before optimising. Use <code>timeit.timeit()</code> for benchmarking. Use <code>tracemalloc</code> for memory leaks. Remember: local variable access is faster than global or attribute access — cache frequently used globals/methods in local variables inside hot loops.",
  gotchas: ["<code>sys.getsizeof(lst)</code> only measures the list container overhead, not the contained objects", "Free-threaded builds (Python 3.13t+) may have different performance characteristics — profile on your target build"],
  example: `import sys, cProfile, pstats, io, timeit

# __slots__ saves ~100 bytes per instance
class WithDict:
    def __init__(self, x, y): self.x = x; self.y = y
class WithSlots:
    __slots__ = ("x","y")
    def __init__(self, x, y): self.x = x; self.y = y
print(sys.getsizeof(WithDict(1,2)))    # ~152 bytes
print(sys.getsizeof(WithSlots(1,2)))   # ~56 bytes

# cProfile
profiler = cProfile.Profile()
profiler.enable()
result = sum(x**2 for x in range(100_000))
profiler.disable()
s = io.StringIO()
pstats.Stats(profiler, stream=s).sort_stats("cumulative").print_stats(5)

# timeit
t = timeit.timeit("sum(range(1000))", number=10_000)
print(f"sum: {t:.3f}s")

# sys.monitoring (Python 3.12+, PEP 669) — low-overhead hook
# Used by modern debuggers/profilers instead of sys.settrace
sys.monitoring.set_events(
    sys.monitoring.PROFILER_ID,
    sys.monitoring.events.CALL)

# Check free-threaded build (Python 3.13+)
if hasattr(sys, "_is_gil_enabled"):
    print(f"GIL enabled: {sys._is_gil_enabled()}")

# Local var cache in hot loop
import math
def fast_sin(xs):
    sin = math.sin    # avoid attr lookup in hot path
    return [sin(x) for x in xs]`
},

"concurrency::threading, multiprocessing & futures": {
  summary: "<code>threading</code> is suitable for I/O-bound work. The GIL limits true CPU-parallel execution in the standard CPython build — but Python 3.13 (PEP 703) introduced an optional free-threaded build (<code>python3.13t</code>) and Python 3.14 (PEP 779) promoted it to officially supported. The standard GIL build still achieves true parallelism during I/O waits and C extension calls. <code>multiprocessing</code> spawns separate processes — bypasses the GIL on all builds. <code>ThreadPoolExecutor</code> / <code>ProcessPoolExecutor</code> provide a high-level futures API. <code>queue.Queue</code> is the safest way to pass data between threads.",
  when_to_use: "Use ThreadPoolExecutor for I/O-bound concurrent tasks. Use ProcessPoolExecutor for CPU-bound parallel work. Use asyncio for very high concurrency I/O. Use queue.Queue for safe inter-thread data passing.",
  gotchas: ["multiprocessing on Windows uses spawn — worker functions must be importable (no lambdas) and <code>if __name__ == '__main__':</code> is required", "Free-threaded Python 3.13t / 3.14t is opt-in (separate executable). Many C extensions are not yet thread-safe without the GIL — check py-free-threading.github.io for library status", "Data between processes is pickle-serialised — unpicklable objects (lambdas, file handles) cannot be passed directly"],
  example: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import math, threading, queue, time

# ThreadPoolExecutor — I/O bound
def fetch(url): import urllib.request; return urllib.request.urlopen(url).read()
with ThreadPoolExecutor(max_workers=5) as ex:
    futures = {ex.submit(fetch, url): url for url in urls}
    for fut in as_completed(futures):
        print(futures[fut], len(fut.result()))

# ProcessPoolExecutor — CPU bound
def is_prime(n):
    if n < 2: return False
    return all(n%i!=0 for i in range(2,int(math.sqrt(n))+1))
with ProcessPoolExecutor() as ex:
    results = list(ex.map(is_prime, range(10_000, 10_100)))

# Thread-safe producer-consumer
q = queue.Queue(maxsize=10)
def producer():
    for i in range(20): q.put(i); time.sleep(0.01)
    q.put(None)
def consumer():
    while True:
        item = q.get()
        if item is None: break
        q.task_done()

# Thread-safe counter with Lock
lock = threading.Lock()
counter = 0
def safe_inc():
    global counter
    with lock: counter += 1`
},

// PAGE 3 — STANDARD LIBRARY

"os & sys::os module": {
  summary: "<code>os</code> provides portable OS interfaces: <code>os.getcwd()</code>, <code>os.chdir()</code>, <code>os.listdir()</code>, <code>os.makedirs(exist_ok=True)</code>, <code>os.remove()</code>, <code>os.rename()</code>, <code>os.environ</code> (dict), <code>os.walk()</code> (recursive traversal), <code>os.path</code> (path manipulation), <code>os.getpid()</code>, <code>os.cpu_count()</code>. Prefer <code>pathlib.Path</code> for new path manipulation code.",
  when_to_use: "Use <code>os.environ.get('VAR', 'default')</code> — never <code>os.environ['VAR']</code> (raises <code>KeyError</code>). Use <code>os.makedirs(path, exist_ok=True)</code> to avoid <code>FileExistsError</code>. Use <code>os.walk()</code> for recursive directory traversal. Use <code>shutil.rmtree()</code> for recursive deletion (<code>os.rmdir</code> only works on empty dirs).",
  gotchas: ["<code>os.remove()</code> and <code>os.rmdir()</code> cannot remove non-empty directories — use <code>shutil.rmtree()</code>", "<code>os.makedirs()</code> without <code>exist_ok=True</code> raises <code>FileExistsError</code> if path already exists"],
  example: `import os, shutil
# Environment
db = os.environ.get("DATABASE_URL","sqlite:///local.db")
path = os.environ.get("PATH","")

# Directory operations
os.makedirs("output/reports/2024", exist_ok=True)  # safe

# Walk directory tree
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if not d.startswith(".")]
    for fname in files:
        if fname.endswith(".py"):
            print(os.path.join(root, fname))

# File info
stat = os.stat("file.py")
print(f"Size: {stat.st_size}  Modified: {stat.st_mtime}")
print(f"PID: {os.getpid()}  CPUs: {os.cpu_count()}")

# Safe recursive delete
if os.path.exists("temp"):
    shutil.rmtree("temp")

# Rename / move
os.rename("old.txt","new.txt")
shutil.move("file.txt","subdir/file.txt")`
},

"os & sys::sys module": {
  summary: "<code>sys</code> provides access to interpreter internals. Key: <code>sys.argv</code> (CLI args), <code>sys.stdin</code> / <code>sys.stdout</code> / <code>sys.stderr</code>, <code>sys.path</code> (module search path), <code>sys.version</code>, <code>sys.platform</code>, <code>sys.exit()</code>, <code>sys.getsizeof()</code>, <code>sys.getrecursionlimit()</code> / <code>sys.setrecursionlimit()</code>, <code>sys.modules</code> (imported module cache).",
  when_to_use: "Use <code>sys.argv</code> for simple scripts; argparse for anything complex. Use <code>sys.exit(0)</code> for clean exits, <code>sys.exit(1)</code> for error exits. Modify <code>sys.path</code> for custom imports (but prefer proper package structure). Use <code>sys.modules</code> to check or mock imports.",
  gotchas: ["<code>sys.argv[0]</code> is the script name — user args start at <code>sys.argv[1]</code>", "<code>sys.exit()</code> raises <code>SystemExit</code> which CAN be caught — use this in tests to verify exit codes"],
  example: `import sys, io

# Version and platform
print(sys.version_info.major, sys.version_info.minor)
print(sys.platform)     # 'linux', 'darwin', 'win32'

# CLI args
# python script.py --input data.csv
if len(sys.argv) > 1:
    print(sys.argv[1:])

# Capture stdout
old = sys.stdout
sys.stdout = buf = io.StringIO()
print("captured!")
sys.stdout = old
print(repr(buf.getvalue()))  # 'captured!\n'

# Recursion limit
print(sys.getrecursionlimit())   # 1000 default
sys.setrecursionlimit(10_000)

# Module cache
print("json" in sys.modules)    # True if json was imported

def main():
    if len(sys.argv) < 2:
        print("Usage: script.py <input>", file=sys.stderr)
        sys.exit(1)             # non-zero = error`
},

"pathlib::path operations": {
  summary: "<code>pathlib.Path</code> (Python 3.4+) provides an OO interface for filesystem paths. The <code>/</code> operator joins paths cross-platform. Key attributes: <code>.name</code>, <code>.stem</code>, <code>.suffix</code>, <code>.parent</code>, <code>.parts</code>. Key methods: <code>.exists()</code>, <code>.is_file()</code>, <code>.is_dir()</code>, <code>.read_text()</code>/<code>.write_text()</code>, <code>.glob()</code>/<code>.rglob()</code>, <code>.stat()</code>, <code>.resolve()</code>. <code>Path.walk()</code> (Python 3.12+) is the OO equivalent of <code>os.walk()</code>, yielding <code>(dirpath, dirnames, filenames)</code> tuples. <code>glob()</code>/<code>rglob()</code> gained <code>case_sensitive=</code> (3.12) and <code>recurse_symlinks=</code> (3.13). <code>relative_to(path, walk_up=True)</code> (3.12) allows <code>..</code> in the result.",
  when_to_use: "Use <code>Path</code> everywhere you used <code>os.path</code> string functions. <code>/</code> operator for joining is cleaner than <code>os.path.join()</code>. Use <code>Path.cwd()</code> for current dir, <code>Path.home()</code> for home. Use <code>Path.resolve()</code> for absolute canonical path. Use <code>rglob()</code> for recursive file search.",
  gotchas: ["<code>Path.glob()</code> returns a generator — wrap in <code>list()</code> or iterate once. Holding a generator open while modifying the directory can skip files", "<code>Path.walk()</code> is only available from Python 3.12 — use <code>os.walk()</code> for older versions"],
  example: `from pathlib import Path

# Construction
base   = Path("/data")
config = base / "config" / "settings.yaml"  # / operator

# Components
p = Path("reports/2024/annual.csv")
print(p.name, p.stem, p.suffix, p.parent)

# Read / write shortcuts
cfg = Path("config.json")
text = cfg.read_text(encoding="utf-8")
cfg.write_text('{"k":"v"}', encoding="utf-8")

# Glob with case_sensitive (Python 3.12+)
py_files = list(Path("src").rglob("*.py", case_sensitive=True))

# Path.walk() — OO os.walk() (Python 3.12+)
for dirpath, dirnames, filenames in Path("src").walk():
    dirnames[:] = [d for d in dirnames if not d.startswith(".")]  # prune
    for fname in filenames:
        if fname.endswith(".py"):
            print(dirpath / fname)

# relative_to with walk_up (Python 3.12+)
p = Path("/a/b/c")
print(p.relative_to("/a/x", walk_up=True))  # ../../b/c

# Change extension
new_path = Path("report.txt").with_suffix(".pdf")`
},

"collections::deque, counter, defaultdict": {
  summary: "<code>collections.deque</code>: double-ended queue with O(1) append/pop at both ends (vs O(n) for <code>list.pop(0)</code>). <code>maxlen</code> creates a circular buffer. <code>Counter</code>: dict subclass for counting, supports arithmetic (+, -, &, |) and <code>most_common(n)</code>. <code>defaultdict</code>: auto-creates values via a factory function for missing keys.",
  when_to_use: "Use <code>deque</code> for queues and sliding windows — <code>list.pop(0)</code> is O(n). Use <code>deque(maxlen=n)</code> for rolling buffers. Use <code>Counter</code> for frequency counting. Use <code>defaultdict(list)</code> for grouping patterns.",
  gotchas: ["deque does not support O(1) random access by index — deque[i] for arbitrary i is O(n)", "Counter returns 0 for missing keys (no KeyError) — convenient but can mask typos"],
  example: `from collections import deque, Counter, defaultdict

# deque — O(1) both ends
dq = deque([1,2,3], maxlen=5)
dq.appendleft(0)   # [0,1,2,3]
dq.append(4)       # [0,1,2,3,4]
dq.append(99)      # [1,2,3,4,99] — maxlen auto-drops left
dq.rotate(2)       # [4,99,1,2,3]

# Counter arithmetic
c1 = Counter("aaabbc")
c2 = Counter("abcd")
print(c1 + c2)     # combine
print(c1 - c2)     # subtract (positive only)
print(c1 & c2)     # intersection (min)
print(c1 | c2)     # union (max)
print(c1.most_common(2))   # [('a',3),('b',2)]

# defaultdict grouping
groups = defaultdict(list)
data = [("Alice","Eng"),("Bob","HR"),("Carol","Eng")]
for name, dept in data:
    groups[dept].append(name)
print(dict(groups))  # {'Eng':['Alice','Carol'],'HR':['Bob']}

# defaultdict counter
word_count = defaultdict(int)
for w in "the quick brown fox".split():
    word_count[w] += 1`
},

"collections::namedtuple & chainmap": {
  summary: "namedtuple creates immutable tuple subclasses with named fields. ChainMap chains multiple dicts for lookup without merging — writes go to the first map only. UserDict/UserList/UserString are wrappers for safe subclassing (direct dict/list subclassing can have subtle issues with methods calling each other).",
  when_to_use: "Use namedtuple for simple immutable records with named fields (lightweight vs dataclasses). Use ChainMap for configuration layering: user settings > env vars > defaults, without merging. Use UserDict when you want to subclass dict and override methods safely.",
  gotchas: ["namedtuple field names cannot start with _ or be Python keywords", "ChainMap reads from all maps but writes/deletes only affect the first map — this asymmetry surprises people"],
  example: `from collections import namedtuple, ChainMap

# namedtuple
Point = namedtuple("Point", ["x","y"])
p = Point(3, 4)
print(p.x, p.y)          # 3 4
print(p._asdict())        # OrderedDict
print(p._replace(x=10))  # Point(x=10, y=4)
x, y = p                 # unpackable

# CSV-style usage
import csv, io
Employee = namedtuple("Employee", ["name","age","dept"])
data = "Alice,30,Eng\nBob,25,Mkt"
rows = [Employee(*r) for r in csv.reader(io.StringIO(data))]
print(rows[0].name)       # Alice

# ChainMap — layered config
system = {"debug":False,"log":"INFO","workers":4}
env    = {"log":"DEBUG"}
cli    = {"workers":8}
cfg = ChainMap(cli, env, system)
print(cfg["log"])         # 'DEBUG' (env wins)
print(cfg["workers"])     # 8       (cli wins)
print(cfg["debug"])       # False   (system default)

# Write goes to FIRST map only
cfg["new_key"] = "value"
print(cli["new_key"])     # 'value'
print("new_key" in system)  # False`
},

"itertools::iterators & combinatorics": {
  summary: "<code>itertools</code> provides memory-efficient iterator building blocks. Infinite: <code>count</code>, <code>cycle</code>, <code>repeat</code>. Finite: <code>chain</code>, <code>chain.from_iterable</code>, <code>islice</code>, <code>takewhile</code>, <code>dropwhile</code>, <code>filterfalse</code>, <code>compress</code>, <code>groupby</code>, <code>accumulate</code>, <code>starmap</code>, <code>batched</code> (3.12+). <code>pairwise(iterable)</code> (Python 3.10+) yields successive overlapping pairs: <code>pairwise('ABCD')</code> → <code>(A,B),(B,C),(C,D)</code>. <code>starmap(func, iterable)</code> applies a function to arguments from an iterable of tuples — like <code>map()</code> but unpacks each element. <code>compress(data, selectors)</code> filters data by a boolean selector iterable. Combinatorics: <code>product</code>, <code>permutations</code>, <code>combinations</code>.",
  when_to_use: "Use <code>chain.from_iterable()</code> to flatten one level of nesting. Use <code>groupby()</code> after sorting to group consecutive elements. Use <code>islice()</code> to limit infinite generators. Use <code>batched()</code> (3.12+) or manual chunking with <code>zip_longest</code> for fixed-size batches.",
  gotchas: ["<code>groupby()</code> only groups CONSECUTIVE equal keys — sort first if you want all matching items together", "itertools objects are lazy and single-use — call the function again to re-iterate"],
  example: `from itertools import (chain, islice, groupby, accumulate,
                        batched, pairwise, starmap, compress,
                        product, combinations, permutations)

# pairwise — overlapping pairs (Python 3.10+)
print(list(pairwise('ABCD')))   # [('A','B'),('B','C'),('C','D')]
print(list(pairwise(range(5)))) # [(0,1),(1,2),(2,3),(3,4)]

# starmap — unpack tuple args
print(list(starmap(pow, [(2,3),(3,2),(10,2)])))  # [8, 9, 100]

# compress — filter by boolean selector
data      = ["a","b","c","d","e"]
selectors = [1, 0, 1, 0, 1]
print(list(compress(data, selectors)))  # ["a","c","e"]

# chain.from_iterable — flatten one level
print(list(chain.from_iterable([[1,2],[3,4]])))  # [1,2,3,4]

# groupby — MUST sort first
data = [("A","x"),("B","y"),("A","z")]
for k, g in groupby(sorted(data), key=lambda t: t[0]):
    print(k, list(g))

# accumulate — running totals
print(list(accumulate([100,200,150])))  # [100,300,450]

# batched (Python 3.12)
for batch in batched(range(10), 3): print(batch)

# Combinatorics
print(list(combinations("ABC",2)))   # 3 pairs`
},

"functools::higher-order tools": {
  summary: "functools provides tools for working with functions. Key: lru_cache/cache (memoisation), partial (partial application), reduce (left-fold), wraps (decorator metadata), total_ordering (comparison derivation), singledispatch (type-based overloading), cached_property (computed-once per instance).",
  when_to_use: "Use <code>@cache</code> (Python 3.9+, unbounded) or <code>@lru_cache(maxsize=128)</code> for repeated pure function calls. Use <code>@singledispatch</code> for type-based dispatch instead of <code>isinstance</code> chains. Use <code>partial</code> to bind arguments for callbacks or sort keys.",
  gotchas: ["<code>@lru_cache</code> requires all arguments to be hashable — raises <code>TypeError</code> for list/dict args", "<code>functools.reduce</code> requires a non-empty iterable if no initial value is provided — always pass the third initialiser argument"],
  example: `from functools import (lru_cache, cache, partial, reduce,
                        wraps, total_ordering, singledispatch)
import operator

# Memoisation
@cache                           # Python 3.9+, unbounded
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)
print(fib(50))

@lru_cache(maxsize=256)          # bounded LRU
def expensive(key: str) -> dict:
    return fetch_from_api(key)

# partial
def power(base, exp): return base ** exp
square = partial(power, exp=2)
cube   = partial(power, exp=3)
print(square(4), cube(3))       # 16 27

# reduce
factorial = lambda n: reduce(operator.mul, range(1,n+1), 1)
print(factorial(5))             # 120

# singledispatch — type-based overloading
@singledispatch
def to_json(obj) -> str:
    raise TypeError(f"Cannot serialise {type(obj)}")

@to_json.register(int)
@to_json.register(float)
def _(obj) -> str: return str(obj)

@to_json.register(list)
def _(obj) -> str:
    return "[" + ",".join(map(to_json, obj)) + "]"

print(to_json(42))              # '42'
print(to_json([1, 2.5]))        # '[1,2.5]'`
},

"datetime::date & time operations": {
  summary: "The <code>datetime</code> module provides <code>date</code>, <code>time</code>, <code>datetime</code>, <code>timedelta</code>, <code>timezone</code>. <code>datetime.now()</code> is naive; <code>datetime.now(tz=timezone.utc)</code> is aware. Python 3.11+ adds <code>datetime.UTC</code> as a shorthand alias for <code>timezone.utc</code>. <code>datetime.utcnow()</code> and <code>datetime.utcfromtimestamp()</code> are <strong>deprecated since Python 3.12</strong> — use <code>datetime.now(datetime.UTC)</code> instead. <code>datetime.fromisoformat()</code> was enhanced in Python 3.11 to support the full ISO 8601 format; on Python 3.10 and earlier it only accepted strings that <code>isoformat()</code> itself would produce. <code>zoneinfo.ZoneInfo</code> (Python 3.9+) is the modern timezone library — replaces <code>pytz</code>.",
  when_to_use: "Always store datetimes in UTC internally, convert to local time only for display. Use <code>timedelta</code> for arithmetic. Use <code>datetime.fromisoformat()</code> (enhanced in 3.11 to fully support ISO 8601). Use <code>zoneinfo.ZoneInfo</code> instead of pytz for new code.",
  gotchas: ["Naive and aware datetimes cannot be compared or subtracted — Python raises <code>TypeError</code>. Be consistent throughout", "<code>datetime.utcnow()</code> is deprecated in Python 3.12 — it returns a naive datetime despite the name. Use <code>datetime.now(datetime.UTC)</code>", "<code>fromisoformat()</code> on Python ≤ 3.10 cannot parse arbitrary ISO 8601 strings (e.g. <code>'2024-11-15T10:30:00Z'</code> fails — the <code>Z</code> suffix is not supported until 3.11)"],
  example: `from datetime import datetime, date, timedelta, timezone, UTC  # UTC alias: Python 3.11+
from zoneinfo import ZoneInfo

# UTC alias (Python 3.11+) — shorter than timezone.utc
now = datetime.now(UTC)          # preferred
# datetime.utcnow()              # DEPRECATED in 3.12!
print(now.isoformat())           # "2024-...+00:00"

# Convert to local timezone
ist = ZoneInfo("Asia/Kolkata")
print(now.astimezone(ist).strftime("%Y-%m-%d %H:%M %Z"))

# fromisoformat — full ISO 8601 support in Python 3.11+
dt = datetime.fromisoformat("2024-11-15T10:30:00+05:30")  # OK in 3.11+
dt2 = datetime.fromisoformat("2024-11-15T10:30:00Z")      # OK in 3.11+ (Z=UTC)
# On Python 3.10: only isoformat()-produced strings work

# Arithmetic
deadline = now + timedelta(days=30, hours=8)
print((deadline - now).days)    # 30

# Date-only
today    = date.today()
birthday = date(1990, 3, 15)
print((today - birthday).days // 365, "years old")`
},

"regular expressions::re module": {
  summary: "Python's <code>re</code> module provides PCRE-like regex. Three anchoring levels: <code>re.match()</code> anchors to the START only; <code>re.fullmatch()</code> anchors both START and END (use this for validation); <code>re.search()</code> matches anywhere. Match objects always have boolean value <code>True</code> — this is why <code>if m := re.search(...):</code> works cleanly. Compile with <code>re.compile()</code> for reuse. Named groups <code>(?P&lt;name&gt;...)</code> for readability. <code>re.VERBOSE</code> for complex patterns with comments. Atomic groups <code>(?&gt;...)</code> (Python 3.11+) suppress backtracking into the group — useful for catastrophic backtracking prevention.",
  when_to_use: "Compile with <code>re.compile()</code> when using a pattern multiple times. Use named groups for readability. Use <code>re.VERBOSE</code> for complex patterns with comments. Use <code>re.fullmatch()</code> when the entire string must match (not just the start).",
  gotchas: ["<code>re.match()</code> only anchors the START — <code>re.match(r'\d+', '123abc')</code> succeeds! Use <code>re.fullmatch()</code> to require the entire string to match", "Greedy vs lazy: <code>.*</code> matches as much as possible; <code>.*?</code> as little. On complex patterns greedy can cause catastrophic backtracking — use atomic groups <code>(?>...)</code> (3.11+) to prevent it", "<code>re.sub()</code> with a function argument — the function receives a match object, not the matched string"],
  example: `import re

# match vs search vs fullmatch
print(re.match(r"\d+", "123abc"))     # Match (only anchors start)
print(re.fullmatch(r"\d+", "123abc")) # None  (end not anchored)
print(re.fullmatch(r"\d+", "123"))    # Match (use for validation)
print(re.search(r"\d+", "abc123"))    # Match at pos 3

# Match objects are always truthy
text = "Error on line 42"
if m := re.search(r"line (\d+)", text):  # walrus works because match is truthy
    print(m.group(1))   # "42"

# Named groups + VERBOSE pattern
EMAIL = re.compile(r"""
    (?P<user> [\w.+-]+)    # local part
    @
    (?P<domain> [\w-]+ \. [\w.]+)  # domain
""", re.VERBOSE | re.IGNORECASE)

if m := EMAIL.fullmatch("alice@example.com"):
    print(m.group("user"), m.group("domain"))

# Atomic group (Python 3.11+) — prevent backtracking
# (?>a+)b will never match "aaac" — no backtracking into a+
pat = re.compile(r"(?>\d+)\.\d+")

# sub with function
masked = re.sub(r"\d", lambda m: "*", "Card: 1234-5678")
print(masked)  # "Card: ****-****"`
},

"json, csv & logging::json & csv": {
  summary: "<code>json.dumps()</code> serialises Python to JSON string; <code>json.loads()</code> parses JSON. <code>json.dump()</code> / <code>json.load()</code> work with files. CSV: use <code>csv.DictReader</code> / <code>csv.DictWriter</code> for named-column access. Always open CSV files with <code>newline=''</code> to prevent double-newline on Windows. All <code>csv.reader</code> values are strings — convert explicitly.",
  when_to_use: "Use <code>indent=2</code> for human-readable JSON. Use <code>sort_keys=True</code> for deterministic output. Handle non-serialisable types (<code>datetime</code>, <code>Decimal</code>, <code>set</code>) with a custom <code>JSONEncoder</code>. Use <code>csv.DictReader</code> over <code>csv.reader</code> for readability.",
  gotchas: ["JSON keys must be strings — integer dict keys become strings on round-trip", "CSV files must be opened with newline='' — without it, extra blank rows appear on Windows"],
  example: `import json, csv
from datetime import datetime
from decimal import Decimal

# Custom JSON encoder
class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime): return obj.isoformat()
        if isinstance(obj, Decimal):  return float(obj)
        if isinstance(obj, set):      return sorted(obj)
        return super().default(obj)

result = json.dumps({
    "ts": datetime.now(), "price": Decimal("19.99"),
    "tags": {"python","web"}
}, cls=Encoder, indent=2)

# File I/O
with open("data.json","w") as f:
    json.dump({"key":"val"}, f, indent=2)
with open("data.json") as f:
    data = json.load(f)

# CSV write
employees = [{"name":"Alice","salary":95000},{"name":"Bob","salary":75000}]
with open("emp.csv","w",newline="",encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["name","salary"])
    w.writeheader(); w.writerows(employees)

# CSV read — values are strings!
with open("emp.csv",newline="",encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["salary"]))`
},

"json, csv & logging::logging": {
  summary: "Python's logging module provides a hierarchical, configurable system. Levels: <code>DEBUG < INFO < WARNING < ERROR < CRITICAL</code>. Always use <code>logging.getLogger(__name__)</code> in modules. <code>logging.basicConfig(force=True)</code> (Python 3.8+) re-configures even if handlers are already attached — without <code>force=True</code>, <code>basicConfig()</code> silently does nothing if any handler exists. <code>QueueHandler</code> + <code>QueueListener</code> is the recommended production pattern: logging calls push to a queue (fast, non-blocking) while a background thread drains it to the actual handlers — preventing slow handlers (file rotation, SMTP) from blocking web-serving threads. Always use <code>%s</code> lazy formatting in log calls — f-strings evaluate eagerly even if the message is never emitted.",
  when_to_use: "Configure the root logger in application entry points using <code>dictConfig</code>. Library code should only add a <code>NullHandler</code>. Use <code>logging.config.dictConfig()</code> for production configuration. Use lazy formatting: <code>log.debug('value: %s', val)</code> not f-strings — the f-string evaluates even if the message won't be logged.",
  gotchas: ["<code>logging.basicConfig()</code> has no effect if the root logger already has handlers — pass <code>force=True</code> (Python 3.8+) to override, or call it before any other logging code", "Always use <code>%s</code> lazy formatting in log calls — f-strings evaluate eagerly even if the message is never emitted"],
  example: `import logging, logging.config, logging.handlers, queue

# Module-level logger (use in all modules)
log = logging.getLogger(__name__)

# basicConfig with force=True — re-configures existing setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    force=True   # without this, silently no-ops if handlers exist!
)

# Production: QueueHandler + QueueListener (non-blocking)
log_queue = queue.Queue(-1)   # unbounded
queue_handler = logging.handlers.QueueHandler(log_queue)

file_handler = logging.handlers.RotatingFileHandler(
    "app.log", maxBytes=10_485_760, backupCount=5)
file_handler.setFormatter(
    logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

# Listener runs in background thread — file writes don't block callers
listener = logging.handlers.QueueListener(
    log_queue, file_handler, respect_handler_level=True)
listener.start()   # starts background thread

# Route root logger to queue (fast, non-blocking)
logging.getLogger().handlers = [queue_handler]

# Lazy %s formatting — NOT f-strings
log.info("User %s logged in from %s", "alice", "192.0.2.1")
log.error("Failed: %s", "timeout", exc_info=True)

# listener.stop() on shutdown to flush queue`
},

"subprocess::running external commands": {
  summary: "<code>subprocess.run()</code> (Python 3.5+) runs a command and blocks until completion. <code>capture_output=True</code> captures stdout+stderr. <code>check=True</code> raises <code>CalledProcessError</code> on non-zero exit. <code>text=True</code> decodes to str. Always pass a list — never <code>shell=True</code> with user input. <code>subprocess.DEVNULL</code> silently discards output (redirects to <code>/dev/null</code>). <code>stderr=subprocess.STDOUT</code> merges stderr into stdout. After a <code>TimeoutExpired</code> with <code>Popen</code>, the child is NOT automatically killed — you must call <code>proc.kill()</code> then <code>proc.communicate()</code> to clean up properly.",
  when_to_use: "Always pass a list of arguments, not a shell string. Use <code>timeout=</code> to prevent hanging. Use <code>Popen</code> for streaming large output line-by-line. Use <code>shlex.split()</code> to convert a shell string to a safe list when needed.",
  gotchas: ["<code>shell=True</code> is a security risk if any part of the command comes from user input — always use lists", "Captured output is bytes by default — pass <code>text=True</code> (or <code>encoding='utf-8'</code>) to get strings", "After <code>TimeoutExpired</code> with <code>Popen</code>, the child is NOT automatically killed — call <code>proc.kill()</code> then <code>proc.communicate()</code> to clean up"],
  example: `import subprocess

# Basic run
r = subprocess.run(
    ["git","log","--oneline","-5"],
    capture_output=True, text=True, check=True, timeout=30)
print(r.stdout)

# DEVNULL — discard output completely
subprocess.run(["make","clean"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# stderr=STDOUT — merge stderr into stdout stream
r = subprocess.run(["python","-W","error","-c","import warnings"],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
print(r.stdout)   # combined output

# Popen timeout — MUST kill + communicate to clean up
proc = subprocess.Popen(
    ["long_running_cmd"], stdout=subprocess.PIPE, text=True)
try:
    stdout, _ = proc.communicate(timeout=5)
except subprocess.TimeoutExpired:
    proc.kill()              # terminate the child
    stdout, _ = proc.communicate()  # collect remaining output
    print("Timed out")

# Pipeline — pipe stdout of one into stdin of next
p1 = subprocess.run(["cat","file.txt"], capture_output=True)
p2 = subprocess.run(["grep","python"],
    input=p1.stdout, capture_output=True, text=True)
print(p2.stdout)`
},

"argparse::command-line parsing": {
  summary: "argparse parses command-line arguments with automatic help generation. <code>add_argument()</code> defines expected args. <code>parse_args()</code> parses <code>sys.argv</code>. Supports: positional args, optional flags, defaults, type conversion, choices, nargs, mutually exclusive groups, subcommands (<code>add_subparsers()</code>). Automatically generates <code>--help</code>.",
  when_to_use: "Use argparse for any script taking CLI arguments. Use <code>add_subparsers()</code> for git-style subcommands. Use <code>type=Path</code> (from pathlib) to auto-convert path strings. Use <code>action='store_true'</code> for boolean flags. Use <code>formatter_class=ArgumentDefaultsHelpFormatter</code> to show defaults in help.",
  gotchas: ["<code>parse_args()</code> calls <code>sys.exit(2)</code> on parse errors — use <code>parse_known_args()</code> or pass a list in tests", "Argument names with hyphens (<code>--log-level</code>) become underscores in the namespace: <code>args.log_level</code>"],
  example: `import argparse
from pathlib import Path

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Data processing tool",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument("input", type=Path)
    p.add_argument("-o","--output", type=Path, default=Path("out.csv"))
    p.add_argument("-v","--verbose", action="store_true")
    p.add_argument("--format", choices=["csv","json","parquet"], default="csv")
    p.add_argument("--verbosity", action="count", default=0)
    grp = p.add_mutually_exclusive_group()
    grp.add_argument("--overwrite", action="store_true")
    grp.add_argument("--append",    action="store_true")
    return p

# Subcommands
parser = argparse.ArgumentParser()
sub = parser.add_subparsers(dest="command")
init_p = sub.add_parser("init")
run_p  = sub.add_parser("run")
run_p.add_argument("--config", type=Path)

def main():
    args = build_parser().parse_args()
    if args.verbose:
        print(f"Processing {args.input} -> {args.output}")

if __name__ == "__main__":
    main()`
},

"unittest::unittest & doctest": {
  summary: "<code>unittest</code> is Python's built-in xUnit-style test framework. Tests are methods in <code>TestCase</code> subclasses starting with <code>test_</code>. <code>setUp()</code> / <code>tearDown()</code> run before/after each test. <code>setUpClass()</code> / <code>tearDownClass()</code> are class-level. Key assertions: <code>assertEqual</code>, <code>assertTrue</code>, <code>assertRaises</code>, <code>assertAlmostEqual</code>, <code>assertIn</code>, <code>assertIsNone</code>. <code>unittest.mock</code> provides <code>Mock</code>, <code>MagicMock</code>, <code>patch</code>, <code>patch.object</code>.",
  when_to_use: "Use <code>unittest</code> for xUnit-style testing (enterprise/legacy codebases). For new projects prefer pytest. <code>unittest.mock</code> is excellent regardless of test runner. Use <code>patch()</code> as a context manager or decorator for clean, scoped mocking.",
  gotchas: ["Test methods MUST start with test_ — other methods are silently ignored", "assertAlmostEqual checks 7 decimal places by default — use places= or delta= for different precision"],
  example: `import unittest
from unittest.mock import patch, MagicMock

class CalculatorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.calc = Calculator()

    def setUp(self):
        self.calc.reset()

    def test_add(self):
        self.assertEqual(self.calc.add(2,3), 5)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            self.calc.divide(10, 0)

    def test_float(self):
        self.assertAlmostEqual(0.1+0.2, 0.3, places=7)

    def test_with_mock(self):
        with patch("mymodule.requests.get") as mock_get:
            mock_get.return_value = MagicMock(
                status_code=200,
                json=lambda: {"result": 42}
            )
            result = self.calc.fetch_remote("http://api.test")
            mock_get.assert_called_once_with("http://api.test")
            self.assertEqual(result, 42)

if __name__ == "__main__":
    unittest.main(verbosity=2)`
},

// PAGE 4 — DATA SCIENCE & THIRD-PARTY

"numpy — arrays::array creation & indexing": {
  summary: "NumPy ndarrays are fixed-type, fixed-size, n-dimensional arrays stored in contiguous memory. Creation: <code>np.array()</code>, <code>np.zeros()</code>, <code>np.ones()</code>, <code>np.arange()</code>, <code>np.linspace()</code>, <code>np.random.default_rng()</code>. Key attributes: <code>shape</code>, <code>dtype</code>, <code>ndim</code>, <code>size</code>, <code>itemsize</code>. Indexing: integer, slice (returns VIEW), boolean (returns COPY), fancy/integer-array indexing (returns COPY).",
  when_to_use: "Use NumPy for any numeric array processing — 10-100x faster than Python lists due to SIMD and cache locality. Use <code>dtype=np.float32</code> for ML workloads to halve memory vs <code>float64</code>. Use <code>np.random.default_rng(seed)</code> for reproducible random numbers (replaces legacy <code>np.random</code>).",
  gotchas: ["Slices return VIEWS — modifying a slice modifies the original array. Use <code>.copy()</code> for independence", "Integer-array indexing returns a COPY, not a view — assigning to a fancy-indexed result does not update the original"],
  example: `import numpy as np

# Creation
a  = np.array([1,2,3,4,5], dtype=np.float64)
z  = np.zeros((3,4))
i  = np.eye(3)
r  = np.arange(0, 10, 2)    # [0,2,4,6,8]
l  = np.linspace(0, 1, 5)   # [0. .25 .5 .75 1.]
rng  = np.random.default_rng(42)
rand = rng.standard_normal((3,3))

# Attributes
print(a.shape, a.dtype, a.ndim, a.size)  # (5,) float64 1 5

# Indexing
m = np.arange(12).reshape(3,4)
print(m[1,2])          # 6
print(m[:,1])          # [1,5,9]  column
print(m[1:,2:])        # 2x2 subarray

# Views vs copies
orig = np.array([1,2,3,4])
view = orig[1:3]       # VIEW — shares memory
view[0] = 99
print(orig)            # [1,99,3,4] — modified!
copy = orig[1:3].copy() # explicit copy

# Boolean indexing (copy)
data = np.array([1,-2,3,-4,5])
print(data[data > 0])  # [1 3 5]
data[data < 0] = 0     # in-place masking`
},

"numpy — operations::vectorised ops & broadcasting": {
  summary: "NumPy operations are vectorised — element-wise, no Python loops needed. Broadcasting extends operations to arrays of different shapes: dimensions compared trailing-first; each must be equal or one of them must be 1 (stretched). Universal functions (ufuncs) like <code>np.sqrt</code>, <code>np.exp</code> are highly optimised C/Fortran. <code>@</code> operator for matrix multiply.",
  when_to_use: "Replace all Python loops over arrays with NumPy vectorised operations. Use <code>np.where(cond, x, y)</code> as vectorised if-else. Use <code>np.einsum()</code> for complex tensor operations. Use <code>np.apply_along_axis()</code> only as a last resort — it is essentially a Python loop.",
  gotchas: ["Broadcasting can silently create huge intermediate arrays — check shapes before broadcasting large arrays", "np.sum(arr, axis=0) sums along rows (result has shape of one row); np.sum(arr, axis=1) sums along columns (result has shape of one column)"],
  example: `import numpy as np

# Vectorised arithmetic
a = np.array([1,2,3,4,5])
print(a * 2 + 1)            # [3,5,7,9,11]
print(np.sqrt(a))           # element-wise

# Broadcasting
row = np.array([[1,2,3]])     # shape (1,3)
col = np.array([[10],[20],[30]]) # shape (3,1)
result = col + row            # shape (3,3)
print(result)
# [[11 12 13]
#  [21 22 23]
#  [31 32 33]]

# Aggregation
m = np.array([[1,2,3],[4,5,6]])
print(np.sum(m))              # 21
print(np.sum(m, axis=0))      # [5,7,9]  per column
print(np.sum(m, axis=1))      # [6,15]   per row

# Matrix multiply
A = np.random.rand(3,4)
B = np.random.rand(4,5)
C = A @ B                     # (3,5)

# Linear algebra
eigvals, eigvecs = np.linalg.eig(np.array([[4,2],[1,3]]))
U, S, Vt = np.linalg.svd(A)   # SVD

# np.where — vectorised conditional
x = np.array([-2,-1,0,1,2])
print(np.where(x >= 0, x, 0)) # [0,0,0,1,2] (ReLU-like)`
},

"pandas — series & dataframe::creation & inspection": {
  summary: "<code>Series</code> is a 1D labelled array; <code>DataFrame</code> is a 2D labelled table. Creation: <code>pd.read_csv()</code>, <code>pd.read_parquet()</code>, <code>pd.read_excel()</code>, <code>pd.DataFrame(dict)</code>. Inspection: <code>head()</code>, <code>tail()</code>, <code>info()</code>, <code>describe()</code>, <code>dtypes</code>, <code>shape</code>, <code>value_counts()</code>. <code>df['col']</code> returns a Series; <code>df[['col']]</code> returns a single-column DataFrame.",
  when_to_use: "Use <code>df.info(memory_usage='deep')</code> to check actual memory usage. Specify <code>dtype=</code> when reading CSVs to avoid inference overhead. Use <code>pd.read_parquet()</code> for large datasets — much faster than CSV. Use <code>df.select_dtypes(include='number')</code> to select numeric columns.",
  gotchas: ["Pandas uses NaN (float) for missing numeric data — this can coerce integer columns to float. Use nullable integer dtype Int64 (capital I) for nullable integers", "df['col'] vs df[['col']] — single brackets return a Series, double brackets return a DataFrame"],
  example: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name":   ["Alice","Bob","Carol","Dave"],
    "dept":   ["Eng","Mkt","Eng","HR"],
    "salary": [95000, None, 88000, 65000],
    "years":  [5, 3, 7, 2],
})

print(df.shape)            # (4, 4)
print(df.dtypes)
print(df.describe())       # numeric stats
print(df.info())           # non-null counts

# Selection
print(df["name"])                   # Series
print(df[["name","salary"]])        # DataFrame
print(df[df["salary"] > 80000])     # boolean filter
print(df.loc[0,"name"])             # label-based
print(df.iloc[0,1])                 # position-based

# Read from file
# df = pd.read_csv("data.csv",
#     dtype={"id":"int32"},
#     parse_dates=["created_at"],
#     index_col="id")

# Adding columns
df["bonus"]  = df["salary"] * 0.1
df["senior"] = df["years"] >= 5
df["rank"]   = df["salary"].rank(ascending=False)`
},

"pandas — transform & clean::transform & clean": {
  summary: "Core transformations: <code>assign()</code> for chaining-friendly column creation, <code>apply()</code> for row/column functions, <code>map()</code> (element-wise on Series), <code>query()</code> for SQL-like filtering, <code>sort_values()</code>, <code>drop_duplicates()</code>, <code>fillna()</code> / <code>dropna()</code>. Method chaining with <code>pipe()</code> for custom steps. <code>.str</code> accessor for vectorised string ops. <code>.dt</code> accessor for datetime ops.",
  when_to_use: "Use <code>assign()</code> for method chaining instead of <code>df['col'] = ...</code>. Use <code>query()</code> for readable string-expression filters. Use <code>pipe(fn)</code> to insert custom functions into chains. Prefer vectorised ops over <code>apply()</code> — <code>apply()</code> is essentially a Python loop.",
  gotchas: ["<code>SettingWithCopyWarning</code>: assign to <code>df.loc[]</code> not to a slice. Use <code>assign()</code> to create modified copies", "Pandas uses <code>NaN</code> (float) for missing numeric data — this can coerce integer columns to float. Use nullable integer dtype <code>Int64</code> (capital I) for nullable integers"],
  example: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name":   ["Alice","Bob","Carol",None],
    "salary": [95000, None, 88000, 65000],
    "dept":   ["Eng","Mkt","Eng","HR"],
})

# Method chaining pipeline
result = (df
    .dropna(subset=["name"])
    .fillna({"salary": df["salary"].median()})
    .assign(
        name     = lambda d: d["name"].str.title(),
        salary_k = lambda d: d["salary"] / 1000,
        senior   = lambda d: d["salary"] > 85000,
    )
    .query("dept == 'Eng'")
    .sort_values("salary", ascending=False)
    .reset_index(drop=True)
)

# Vectorised string ops
df["name_lower"] = df["name"].str.lower().str.strip()
df["initials"]   = df["name"].str.extract(r"(\b\w)")

# Map for category replace
df["dept"] = df["dept"].map({
    "Eng":"Engineering","Mkt":"Marketing","HR":"Human Resources"})

# apply (last resort — vectorise if possible)
df["grade"] = df["salary"].apply(
    lambda s: "A" if s >= 90000 else "B" if s >= 75000 else "C")`
},

"pandas — groupby & merge::groupby & merge": {
  summary: "<code>groupby()</code> splits rows into groups, applies a function, combines results (split-apply-combine). <code>agg()</code> applies multiple aggregations. <code>transform()</code> returns a same-index result (no rows dropped) — useful for adding group stats back to original. <code>pd.merge()</code> is SQL-style join. <code>pd.concat()</code> stacks DataFrames. Use <code>validate=</code> to catch unexpected relationship cardinality.",
  when_to_use: "Use <code>transform()</code> instead of <code>agg()</code> + merge when adding aggregated values as new columns. Use <code>groupby().filter()</code> to drop entire groups. Use <code>validate='m:1'</code> or <code>'1:1'</code> in <code>merge()</code> to catch accidental cartesian products. Use <code>pd.concat(axis=0)</code> for UNION ALL, <code>axis=1</code> for side-by-side.",
  gotchas: ["<code>groupby()</code> excludes NaN keys by default — use <code>dropna=False</code> to include them", "<code>merge()</code> on non-unique keys creates cartesian product — always check <code>len(result)</code> after a merge"],
  example: `import pandas as pd

df = pd.DataFrame({
    "dept":   ["Eng","Eng","Mkt","HR","Eng","HR"],
    "year":   [2022,2023,2022,2022,2023,2023],
    "salary": [90,95,70,65,100,68],
})

# Named aggregations
result = df.groupby("dept").agg(
    avg = pd.NamedAgg("salary","mean"),
    max = pd.NamedAgg("salary","max"),
    n   = pd.NamedAgg("salary","count"),
)

# transform — add group avg as column
df["dept_avg"] = df.groupby("dept")["salary"].transform("mean")
df["vs_avg"]   = df["salary"] - df["dept_avg"]

# Pivot
pivot = (df.groupby(["dept","year"])["salary"]
           .mean().unstack("year").round(1))

# Merge (SQL JOIN)
employees = pd.DataFrame({"emp_id":[1,2,3],"dept_id":[10,20,10]})
departments = pd.DataFrame({"dept_id":[10,20],"dept_name":["Eng","Mkt"]})
merged = pd.merge(employees, departments, on="dept_id", how="left",
                  validate="m:1")   # raises if not many-to-one

# Concat (stack rows)
q1 = pd.DataFrame({"month":[1,2],"sales":[100,120]})
q2 = pd.DataFrame({"month":[3,4],"sales":[130,140]})
all_q = pd.concat([q1,q2], ignore_index=True)`
},

"matplotlib::plotting basics & subplots": {
  summary: "Matplotlib is Python's foundational plotting library. Two APIs: pyplot state-machine (<code>plt.plot()</code>) and OO (<code>fig, ax = plt.subplots()</code>). The OO API is preferred for production code. <code>Figure</code> is the top-level container; <code>Axes</code> is an individual plot. Key chart types: <code>plot</code>, <code>scatter</code>, <code>bar</code> / <code>barh</code>, <code>hist</code>, <code>boxplot</code>, <code>imshow</code>. <code>twinx()</code> creates a dual y-axis.",
  when_to_use: "Always use the OO API for multi-panel figures. Use <code>plt.style.use('seaborn-v0_8')</code> for publication defaults. Use <code>df.plot(ax=ax)</code> for quick Pandas plots. Set <code>dpi=150</code> and <code>bbox_inches='tight'</code> when saving figures.",
  gotchas: ["<code>plt.show()</code> clears the current figure — don't call it between subplots. Call once at the end or use <code>savefig()</code>", "Axes methods (<code>ax.set_xlabel()</code>, <code>ax.legend()</code>) are preferred over <code>plt.xlabel()</code> pyplot shortcuts in multi-panel figures"],
  example: `import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 2, figsize=(12,5))
fig.suptitle("Analysis", fontsize=14, fontweight="bold")

# Line plot with fill
x = np.arange(12)
y = np.random.randint(50, 200, 12)
axes[0].plot(x, y, marker="o", color="#2563eb", lw=2, label="Revenue")
axes[0].fill_between(x, y, alpha=0.15, color="#2563eb")
axes[0].set_title("Monthly Revenue")
axes[0].set_xlabel("Month"); axes[0].set_ylabel("Revenue ($k)")
axes[0].legend()

# Bar chart with labels
depts  = ["Eng","Mkt","HR","Sales"]
values = [120, 80, 45, 95]
bars = axes[1].bar(depts, values, color=["#2563eb","#16a34a","#d97706","#dc2626"])
axes[1].bar_label(bars, fmt="%d", padding=3)
axes[1].set_title("By Dept")

plt.tight_layout()
fig.savefig("plot.png", dpi=150, bbox_inches="tight")

# Dual y-axis
fig2, ax1 = plt.subplots(figsize=(10,5))
ax2 = ax1.twinx()
ax1.bar(x, y, alpha=0.7, color="#2563eb", label="Revenue")
growth = np.diff(y, prepend=y[0]) / y * 100
ax2.plot(x, growth, color="#dc2626", marker="^", lw=2, label="Growth %")
ax1.set_ylabel("Revenue"); ax2.set_ylabel("Growth %")
plt.tight_layout()`
},

"requests::http client": {
  summary: "<code>requests</code> is the standard Python HTTP client. <code>requests.get</code> / <code>post</code> / <code>put</code> / <code>delete</code> / <code>patch()</code> are convenience methods. Response: <code>r.status_code</code>, <code>r.json()</code>, <code>r.text</code>, <code>r.content</code> (bytes), <code>r.headers</code>. <code>r.raise_for_status()</code> raises <code>HTTPError</code> for 4xx/5xx. Sessions reuse TCP connections and persist headers/cookies. Always set <code>timeout=</code> to prevent indefinite blocking.",
  when_to_use: "Use <code>requests.Session()</code> when making multiple requests to the same host — TCP connection reuse. Always pass <code>timeout=(connect, read)</code> as a tuple. Use <code>HTTPAdapter</code> with <code>Retry</code> for automatic retry. Use <code>stream=True</code> and <code>iter_content()</code> for large downloads.",
  gotchas: ["<code>requests</code> has NO default timeout — a slow server can hang forever. Always pass <code>timeout=(5, 30)</code>", "<code>stream=True</code> keeps the connection open — use it as a context manager to ensure it closes"],
  example: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.3,
              status_forcelist=[429,500,502,503,504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)
session.mount("http://", adapter)
session.headers.update({"Authorization":"Bearer TOKEN"})

# GET with params
r = session.get(
    "https://api.example.com/users",
    params={"page":1,"per_page":100},
    timeout=(5, 30)    # (connect, read) seconds
)
r.raise_for_status()   # HTTPError for 4xx/5xx
users = r.json()

# POST JSON
resp = session.post(
    "https://api.example.com/users",
    json={"name":"Alice","email":"alice@example.com"},
    timeout=(5, 30)
)
resp.raise_for_status()
created = resp.json()

# Stream large download
with session.get("https://example.com/big.zip",
                 stream=True, timeout=(5,60)) as r:
    r.raise_for_status()
    with open("big.zip","wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)`
},

"pydantic v2::models & validation": {
  summary: "Pydantic v2 (2023, Rust-powered, 5-50x faster than v1) validates data using Python type annotations. <code>BaseModel</code> subclasses define schemas. <code>model_validate()</code> validates from dict/object. <code>model_dump()</code> serialises. <code>model_dump(mode='json')</code> gives JSON-serialisable output. <code>field_validator</code>, <code>model_validator</code>, <code>computed_field</code> for custom logic. <code>ConfigDict</code> controls behaviour.",
  when_to_use: "Use Pydantic for API request/response models, config parsing, and any external data. Use <code>model_validate(dict)</code> not direct construction for external data. Use <code>ConfigDict(strict=True)</code> to disable type coercion. Use <code>computed_field</code> for derived properties included in serialisation.",
  gotchas: ["Pydantic v2 has breaking changes from v1 — <code>.dict()</code> is deprecated (use <code>.model_dump()</code>), <code>.parse_obj()</code> is deprecated (use <code>.model_validate()</code>)", "By default Pydantic coerces types: <code>'42'</code> is accepted for <code>int</code>. Use <code>ConfigDict(strict=True)</code> to disable coercion"],
  example: `from pydantic import (BaseModel, Field, field_validator,
                        model_validator, computed_field, ConfigDict)
from typing import Annotated
from datetime import datetime

PositiveInt = Annotated[int, Field(gt=0)]

class Address(BaseModel):
    street: str; city: str; postcode: str

class User(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    id:         PositiveInt
    name:       str = Field(min_length=2, max_length=100)
    email:      str = Field(pattern=r"^[\w.+-]+@[\w-]+\.[\w.]+$")
    age:        int = Field(ge=0, le=150)
    address:    Address
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("name")
    @classmethod
    def titlecase_name(cls, v: str) -> str:
        return v.title()

    @computed_field
    @property
    def is_adult(self) -> bool:
        return self.age >= 18

user = User.model_validate({
    "id": 1, "name": "alice smith", "email": "alice@example.com",
    "age": 30, "address": {"street":"123 Main","city":"Delhi","postcode":"110001"}
})
print(user.name)           # 'Alice Smith'
print(user.is_adult)       # True
print(user.model_dump(mode="json"))`
},

"pytest::fixtures & testing patterns": {
  summary: "pytest is Python's most popular test framework. Tests are functions starting with <code>test_</code>. <code>assert</code> statements work natively. Fixtures (<code>@pytest.fixture</code>) provide reusable setup with dependency injection. Parametrisation (<code>@pytest.mark.parametrize</code>) runs one test with multiple inputs. Built-in fixtures: <code>tmp_path</code>, <code>monkeypatch</code>, <code>capsys</code>, <code>capfd</code>. <code>conftest.py</code> shares fixtures across files.",
  when_to_use: "Use <code>scope='session'</code> for expensive setup (DB connections) shared across all tests. Use <code>scope='function'</code> (default) for isolation. Use <code>pytest.approx()</code> for float comparisons. Use <code>monkeypatch.setenv()</code> for environment variables. Use <code>tmp_path</code> for temporary files.",
  gotchas: ["Fixtures are injected by name — the fixture function name must match the test parameter name exactly", "pytest.raises(ExcType) is a context manager — put only the raising line inside it, not cleanup code"],
  example: `# conftest.py
import pytest
from myapp import create_app, db as _db

@pytest.fixture(scope="session")
def app():
    app = create_app(testing=True)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

# test_calc.py
import pytest

@pytest.mark.parametrize("a,b,expected", [
    (1,2,3),(0,0,0),(-1,1,0),(100,-50,50)
])
def test_add(a, b, expected):
    assert add(a, b) == expected

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError, match="division by zero"):
        divide(10, 0)

def test_float():
    assert 0.1 + 0.2 == pytest.approx(0.3)

def test_env(monkeypatch, tmp_path):
    monkeypatch.setenv("API_KEY","test-key-123")
    cfg = tmp_path / "config.json"
    cfg.write_text('{"debug":true}')
    result = load_config(cfg)
    assert result["debug"] is True

@pytest.mark.slow     # custom mark — run with -m slow
def test_expensive():
    assert big_computation() > 0`
},

"sqlalchemy 2.0::core & orm": {
  summary: "SQLAlchemy 2.0 provides Core (SQL expression language) and ORM (object-relational mapping). 2.0 unified API: <code>Session.execute(select(Model))</code>. Models inherit from <code>Base = DeclarativeBase()</code>. Relationships use <code>Mapped[]</code> type annotations. Async support via <code>create_async_engine</code> and <code>AsyncSession</code>. <code>selectinload()</code> / <code>joinedload()</code> for eager loading to avoid N+1 queries.",
  when_to_use: "Use ORM for application-level CRUD. Use Core for bulk operations and complex SQL. Use <code>with Session() as session:</code> to auto-close. Use <code>selectinload()</code> for relationships to avoid N+1. Use alembic for schema migrations.",
  gotchas: ["Lazy loading (default) triggers new SQL when accessing a relationship outside a session — causes <code>DetachedInstanceError</code>. Use eager loading or access inside session", "SQLAlchemy 2.0 requires <code>session.execute(select(Model))</code> — the legacy <code>session.query(Model)</code> API is deprecated"],
  example: `from sqlalchemy import create_engine, select, String, Integer, ForeignKey
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column,
                              relationship, Session, selectinload)
from typing import List, Optional

class Base(DeclarativeBase): pass

class Dept(Base):
    __tablename__ = "depts"
    id:    Mapped[int] = mapped_column(primary_key=True)
    name:  Mapped[str] = mapped_column(String(100), unique=True)
    emps:  Mapped[List["Emp"]] = relationship(back_populates="dept")

class Emp(Base):
    __tablename__ = "emps"
    id:      Mapped[int]           = mapped_column(primary_key=True)
    name:    Mapped[str]           = mapped_column(String(100))
    salary:  Mapped[Optional[int]] = mapped_column(Integer)
    dept_id: Mapped[int]           = mapped_column(ForeignKey("depts.id"))
    dept:    Mapped["Dept"]        = relationship(back_populates="emps")

engine = create_engine("sqlite:///app.db")
Base.metadata.create_all(engine)

with Session(engine) as s:
    eng = Dept(name="Engineering")
    s.add(eng); s.flush()
    s.add(Emp(name="Alice", salary=95000, dept_id=eng.id))
    s.commit()

    # Eager loading — no N+1
    stmt = (select(Dept)
            .options(selectinload(Dept.emps))
            .where(Dept.name == "Engineering"))
    dept = s.execute(stmt).scalar_one()
    for e in dept.emps:
        print(e.name, e.salary)`
},


"strings::slicing & translate": {
  summary: "String slicing uses <code>[start:stop:step]</code>. All indices can be negative (counting from end). Step <code>-1</code> reverses the string. <code>str.translate()</code> with <code>str.maketrans()</code> is the fastest way to do bulk single-character replacement — much faster than multiple <code>replace()</code> calls.",
  when_to_use: "Use slicing with step for reversals and sampling. Use <code>str.translate()</code> + <code>str.maketrans()</code> for bulk char replacement or removal (e.g. stripping punctuation). Use <code>'sub' in s</code> for simple membership checks.",
  gotchas: ["Slicing never raises IndexError — out-of-range slices return empty or truncated strings, silently masking off-by-one bugs", "len() counts Unicode code points not bytes — len('é') is 1 even though it's 2 bytes in UTF-8"],
  example: `s = "Python 3.12"
print(s[:6])        # 'Python'
print(s[-4:])       # '3.12'
print(s[::-1])      # '21.3 nohtyP'  (reversed)
print(s[::2])       # 'Pto .2'
# Bulk char replace — fast
table = str.maketrans("aeiou", "AEIOU")
print("hello world".translate(table))  # hEllO wOrld
# Remove punctuation
import string
clean = "Hello, World!".translate(
    str.maketrans('', '', string.punctuation))
print(clean)        # Hello World`
},

"lists::correct 2d list": {
  summary: "The <code>*</code> repetition operator on a list containing a mutable object creates multiple references to the SAME inner object. <code>[[]] * 3</code> gives three references to one list — mutating any one mutates all. Use a list comprehension for independent rows.",
  when_to_use: "Always use <code>[default for _ in range(n)]</code> when initialising with mutable defaults. For 2D grids use <code>[[0]*cols for _ in range(rows)]</code>. The <code>*</code> trick is fine for IMMUTABLE defaults like integers: <code>[0] * 10</code> is correct.",
  gotchas: ["<code>[[]] * n</code> looks correct but all rows are the same object in memory", "The same trap applies to dicts, sets, and any mutable default value"],
  example: `# WRONG — all 3 rows are the same list
bad = [[]] * 3
bad[0].append(99)
print(bad)   # [[99], [99], [99]]

# CORRECT — independent inner lists
good = [[] for _ in range(3)]
good[0].append(99)
print(good)  # [[99], [], []]

# 2D grid
rows, cols = 3, 4
grid = [[0] * cols for _ in range(rows)]
grid[1][2] = 7
print(grid[0][2])   # 0 (unaffected)
print(grid[1][2])   # 7`
},

"control flow::walrus operator & ternary": {
  summary: "The walrus operator <code>:=</code> (PEP 572, Python 3.8+) assigns and returns a value in a single expression. Most useful in <code>while</code> loops reading streams and comprehension filters where you need the computed value. The ternary operator <code>a if cond else b</code> is Python's inline conditional.",
  when_to_use: "Use <code>while chunk := f.read(8192):</code> to avoid read-then-check patterns. Use in comprehensions to compute a value once and both filter and use it. Use ternary for simple inline conditionals.",
  gotchas: ["Walrus needs parentheses in some contexts: <code>if (n := len(a)) > 10:</code>", "Ternary has lower precedence than most operators: <code>x = a + b if cond else c</code> parses as <code>x = (a+b) if cond else c</code>"],
  example: `import re
text = "The year is 2025"

# Walrus — assign + check in one expression
if year := re.search(r"\\d{4}", text):
    print(f"Found: {year.group()}")   # Found: 2025

# Walrus in comprehension — compute once, filter + use
data = [1, -2, 3, -4, 5, -6]
results = [y for x in data if (y := x * x) > 4]
print(results)   # [9, 16, 25, 36]

# Walrus in while loop
def count_bytes(path):
    total = 0
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            total += len(chunk)
    return total

# Ternary
status = "even" if 10 % 2 == 0 else "odd"
grade  = "A" if score >= 90 else "B" if score >= 80 else "C"

# Chained comparisons (Pythonic)
print(0 < x < 10)   # True`
},

"functions::closures & higher-order": {
  summary: "A closure captures variables from its enclosing scope by reference, not by value. <code>nonlocal</code> is required to rebind (not just mutate) an enclosing variable. Higher-order functions accept or return functions. <code>operator.itemgetter</code> / <code>attrgetter</code> are faster, cleaner sort-key alternatives to lambdas.",
  when_to_use: "Use closures to create function factories. Use <code>nonlocal</code> when a closure needs to reassign an enclosing variable. Prefer named functions over complex lambdas for readability.",
  gotchas: ["Loop closure bug: all functions in a loop capture the same variable by reference. Fix with a default argument: <code>lambda x, i=i: x*i</code>", "Without <code>nonlocal</code>, assigning to an enclosing variable creates a new local instead of updating the enclosing one"],
  example: `from operator import itemgetter

# Closure factory
def make_multiplier(n):
    def multiply(x):
        return x * n    # captures n from enclosing scope
    return multiply

double = make_multiplier(2)
print(double(5))             # 10

# Loop closure bug and fix
fns_bad  = [lambda x: x * i for i in range(4)]
fns_good = [lambda x, i=i: x * i for i in range(4)]
print([f(10) for f in fns_bad])   # [30,30,30,30] wrong!
print([f(10) for f in fns_good])  # [0,10,20,30] correct

# nonlocal — rebind enclosing variable
def make_counter():
    count = 0
    def increment():
        nonlocal count   # without this, creates new local
        count += 1
        return count
    return increment

c = make_counter()
print(c(), c(), c())   # 1 2 3

# itemgetter as sort key (faster than lambda)
people = [{"name":"Bob","age":30},{"name":"Alice","age":25}]
print(sorted(people, key=itemgetter("age")))`
},

"comprehensions & generators::generator expressions & yield": {
  summary: "Generator expressions <code>(expr for x in iter)</code> produce values lazily — one at a time — using O(1) memory regardless of input size. They are single-use. <code>yield</code> turns a function into a generator. <code>yield from</code> delegates to a sub-generator and correctly propagates <code>send()</code> and <code>throw()</code>.",
  when_to_use: "Use generator expressions when iterating once over large data. Pass directly to aggregators: <code>sum(x**2 for x in range(n))</code>. Use <code>yield from</code> instead of a for-loop to delegate to sub-generators.",
  gotchas: ["Generators are single-use — once exhausted they yield nothing. Call the function again for a fresh generator", "StopIteration raised inside a generator becomes RuntimeError in Python 3.7+ — use return to end a generator"],
  example: `# Generator expression — lazy, O(1) memory
gen   = (x**2 for x in range(1_000_000))
total = sum(gen)    # no list ever built in memory

# Generator function
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print([next(fib) for _ in range(8)])  # [0,1,1,2,3,5,8,13]

# yield from — delegate to sub-generator
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print(list(flatten([1, [2, [3, 4]], 5])))  # [1,2,3,4,5]`
},

"error handling::custom exceptions": {
  summary: "Custom exceptions should inherit from <code>Exception</code> or a specific subclass. Adding <code>__init__</code> allows structured error data. Exception chaining with <code>raise X from Y</code> preserves the root cause. <code>raise X from None</code> suppresses the original context. Python 3.11+ adds <code>exception.add_note()</code>.",
  when_to_use: "Create exception hierarchies for libraries so callers can catch broadly or specifically. Use <code>raise ... from original</code> when wrapping lower-level exceptions. Use <code>raise ... from None</code> when the internal cause would confuse users.",
  gotchas: ["Holding references to exceptions in long-lived data structures prevents garbage collection of the associated frames", "raise ValueError vs raise ValueError() — both work, but the latter is conventional and explicit"],
  example: `class AppError(Exception):
    pass

class ConnectionError(AppError):
    def __init__(self, host: str, port: int):
        self.host = host; self.port = port
        super().__init__(f"Cannot connect to {host}:{port}")

# Exception chaining — preserve root cause
def connect(host, port):
    try:
        import socket
        socket.create_connection((host, port), timeout=5)
    except OSError as e:
        raise ConnectionError(host, port) from e

# Suppress internal detail
def get_user(uid):
    try:
        return db.find(uid)
    except db.NotFoundError:
        raise ValueError(f"User {uid} not found") from None

# Python 3.11+ add_note
try:
    raise ValueError("bad input")
except ValueError as e:
    e.add_note("Hint: must be a positive integer")
    raise`
},

"file i/o & context managers::file i/o": {
  summary: "Always use <code>with open()</code> — ensures the file closes even on exceptions. Mode strings: <code>'r'</code> read text, <code>'w'</code> write (truncate), <code>'a'</code> append, <code>'b'</code> binary. Always specify <code>encoding='utf-8'</code> for text files. Iterate the file object line-by-line for large files to avoid loading everything into memory.",
  when_to_use: "Iterate <code>for line in f:</code> for large files. Use <code>pathlib.Path.read_text()</code>/<code>write_text()</code> for small files. Use <code>io.StringIO</code>/<code>io.BytesIO</code> as in-memory file objects in tests.",
  gotchas: ["Omitting encoding= uses the system default — on Windows often cp1252, causing UnicodeDecodeError on UTF-8 files", "write() does not add newlines automatically — include '\\n' explicitly"],
  example: `from pathlib import Path

# Always: with open() + explicit encoding
with open("data.txt", "w", encoding="utf-8") as f:
    f.write("Hello\\n")
    print("World", file=f)       # print adds newline

# Line-by-line (memory-efficient)
with open("big.log", encoding="utf-8") as f:
    for line in f:
        process(line.rstrip("\\n"))

# Pathlib shortcuts
p = Path("config.json")
text = p.read_text(encoding="utf-8")
p.write_text('{"k":"v"}', encoding="utf-8")

# In-memory file (tests)
import io
buf = io.StringIO()
print("test", file=buf)
print(buf.getvalue())   # 'test\\n'`
},

"file i/o & context managers::context managers": {
  summary: "Context managers implement <code>__enter__</code>/<code>__exit__</code>. <code>@contextlib.contextmanager</code> creates CMs from generator functions with <code>yield</code>. <code>@asynccontextmanager</code> (Python 3.10+ as decorator) is the async equivalent for <code>async with</code>. <code>contextlib.nullcontext()</code> (Python 3.10+) is a no-op CM — useful as a stand-in for an optional CM. <code>ExitStack</code> handles a dynamic number of CMs. <code>suppress(ExcTypes...)</code> silently ignores specified exceptions. LIFO exit order: with <code>a, b</code> — <code>b</code> exits before <code>a</code>.",
  when_to_use: "Use <code>@contextmanager</code> for lightweight CMs without writing a full class. Use <code>ExitStack</code> when the number of resources is not known at write time. Use <code>suppress</code> instead of empty try/except blocks.",
  gotchas: ["If <code>__exit__</code> returns a truthy value the exception is suppressed — rarely intentional", "LIFO exit order: with <code>a, b</code> — <code>b</code> exits before <code>a</code>"],
  example: `from contextlib import (contextmanager, asynccontextmanager,
                         suppress, ExitStack, nullcontext)
import time

@contextmanager
def timer(label="elapsed"):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter()-start:.3f}s")

# asynccontextmanager — for async with
@asynccontextmanager
async def managed_connection(url: str):
    conn = await connect(url)
    try:
        yield conn
    finally:
        await conn.close()

# nullcontext — optional CM stand-in (Python 3.10+)
def process(data, lock=None):
    with (lock if lock is not None else nullcontext()):
        return transform(data)

# suppress — cleaner than try/except/pass
with suppress(FileNotFoundError):
    import os; os.remove("temp.tmp")

# ExitStack — dynamic number of CMs
fnames = ["a.txt","b.txt","c.txt"]
with ExitStack() as stack:
    files = [stack.enter_context(open(f)) for f in fnames]`
},

"builtins & operators::builtins & operators": {
  summary: "Python built-ins are always available without imports. Key: <code>len</code>, <code>range</code>, <code>enumerate</code>, <code>zip</code>, <code>map</code>, <code>filter</code>, <code>sorted</code>, <code>reversed</code>, <code>sum</code>, <code>min</code>/<code>max</code>, <code>abs</code>, <code>round</code>, <code>any</code>/<code>all</code>, <code>isinstance</code>, <code>getattr</code>/<code>setattr</code>/<code>hasattr</code>, <code>vars</code>, <code>dir</code>, <code>type</code>, <code>callable</code>. <code>zip(strict=True)</code> (Python 3.10+) raises <code>ValueError</code> if iterables differ in length. <code>iter(callable, sentinel)</code> — two-argument form calls callable with no args until sentinel is returned; classic use: <code>iter(partial(f.read, 8192), b'')</code>. <code>breakpoint()</code> (Python 3.7+) drops into the debugger at the call site; respects <code>PYTHONBREAKPOINT</code> env var. <code>round()</code> uses banker's rounding (half-to-even) — <code>round(0.5) == 0</code>.",
  when_to_use: "Use <code>isinstance(x, (A, B))</code> for multi-type checks. Use <code>any()</code> / <code>all()</code> with generators for short-circuit evaluation. Use <code>getattr(obj, name, default)</code> for safe dynamic attribute access. Use <code>vars(obj)</code> to introspect instance dicts.",
  gotchas: ["<code>zip()</code> stops at the shortest iterable — use <code>itertools.zip_longest()</code> to pad to the longest", "<code>sorted()</code> returns a new list; <code>reversed()</code> returns a lazy iterator — wrap in <code>list()</code> if needed", "<code>round()</code> uses banker's rounding (half-to-even): <code>round(0.5) == 0</code>, <code>round(1.5) == 2</code>, <code>round(2.5) == 2</code>"],
  example: `import itertools
from functools import partial

# zip(strict=True) — ValueError if lengths differ (Python 3.10+)
names  = ["Alice","Bob"]
scores = [95, 87]
list(zip(names, scores, strict=True))  # safe
# list(zip(names, [1], strict=True))   # ValueError!

# iter(callable, sentinel) — 2-arg form
import io
buf = io.BytesIO(b"hello world 1234")
chunks = list(iter(partial(buf.read, 4), b""))  # read 4 bytes until EOF
print(chunks)  # [b"hell", b"o wo", b"rld ", b"1234"]

# breakpoint() — drop into debugger (Python 3.7+)
# breakpoint()  # equivalent to import pdb; pdb.set_trace()
# PYTHONBREAKPOINT=0 to disable, or set to use pdb alternatives

# round() — banker's rounding (half-to-even)
print(round(0.5))  # 0  (not 1!)
print(round(1.5))  # 2
print(round(2.5))  # 2  (not 3!)
print(round(2.675, 2))  # 2.67  (float precision)

# any/all short-circuit
print(any(x > 4 for x in [1,2,3,4,5]))   # True
print(all(x > 0 for x in [1,2,3,4,5]))   # True

# vars() — instance dict
class Point:
    def __init__(self, x, y): self.x=x; self.y=y
print(vars(Point(1,2)))  # {"x":1,"y":2}`
},

"decorators::built-in decorators": {
  summary: "<code>@property</code> creates managed attributes. <code>@classmethod</code> receives the class as first arg. <code>@staticmethod</code> has no implicit first arg. <code>@functools.cached_property</code> (3.8+) computes once and caches per instance. <code>@functools.lru_cache(maxsize=n)</code> memoises with LRU eviction. <code>@functools.cache</code> (3.9+) is unbounded memoisation.",
  when_to_use: "Use <code>@cached_property</code> for expensive one-time computed properties. Use <code>@lru_cache</code> / <code>@cache</code> for pure functions called repeatedly with the same args. Use <code>@classmethod</code> for alternative constructors like <code>from_json</code> or <code>from_file</code>.",
  gotchas: ["<code>@cached_property</code> is NOT thread-safe in Python 3.12+ (the lock was removed) — use <code>@lru_cache</code> on a method for thread-safe caching", "<code>@lru_cache</code> requires all arguments to be hashable — lists or dicts raise <code>TypeError</code>"],
  example: `import functools, math

class Circle:
    def __init__(self, r: float): self._r = r

    @property
    def radius(self) -> float: return self._r

    @radius.setter
    def radius(self, v: float):
        if v < 0: raise ValueError
        self._r = v
        if "area" in self.__dict__: del self.__dict__["area"]

    @functools.cached_property
    def area(self) -> float:
        print("Computing...")     # runs only once
        return math.pi * self._r ** 2

    @classmethod
    def unit(cls) -> "Circle": return cls(1.0)

    @staticmethod
    def from_diameter(d: float) -> "Circle": return Circle(d/2)

@functools.lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

print(fib(50))
print(fib.cache_info())`
},


"strings::validation methods": {
  summary: "Python strings have ~15 <code>is*()</code> predicate methods for checking character content. Key distinctions: <code>isdecimal()</code> is the strictest — only ASCII 0-9 and Unicode decimal digits (e.g. Arabic-Indic numerals); <code>isdigit()</code> also accepts superscripts (<code>²</code>, <code>³</code>); <code>isnumeric()</code> is broadest — also accepts fractions, Roman numerals. For validating user-entered integers, <code>isdecimal()</code> is almost always what you want. <code>isidentifier()</code> checks if a string is a valid Python identifier — useful for dynamic attribute access and metaprogramming. <code>isascii()</code> (Python 3.7+) checks all characters are in the ASCII range 0-127.",
  when_to_use: "Use <code>isdecimal()</code> (not <code>isdigit()</code>) when validating integer input — it rejects superscripts and other digit-like chars that <code>int()</code> would reject. Use <code>isidentifier()</code> to safely validate names before passing to <code>getattr()</code>. Use <code>isascii()</code> to quickly check if a string needs Unicode handling.",
  gotchas: ["<code>'²'.isdigit()</code> is <code>True</code> but <code>int('²')</code> raises <code>ValueError</code> — <code>isdigit()</code> does not guarantee <code>int()</code> will succeed", "<code>''.isdecimal()</code> returns <code>False</code> for empty strings — all <code>is*</code> methods return <code>False</code> on empty strings"],
  example: `# isdecimal vs isdigit vs isnumeric
print("123".isdecimal())       # True
print("²".isdecimal())         # False (superscript 2)
print("²".isdigit())           # True  (but int("²") raises!)
print("½".isnumeric())         # True  (fraction)
print("½".isdigit())           # False

# For validating integer input — use isdecimal()
def safe_int(s: str) -> int | None:
    return int(s) if s.isdecimal() else None

print(safe_int("42"))     # 42
print(safe_int("4²"))     # None  (safe — rejected)
print(safe_int("-5"))     # None  (minus sign not decimal!)
# For signed integers: s.lstrip("+-").isdecimal()

# isidentifier — validate Python names
attrs = ["name", "123bad", "valid_attr", "__dunder__", "class"]
for a in attrs:
    print(f"{a!r}: identifier={a.isidentifier()}")

# Safe dynamic attribute access
def safe_getattr(obj, name, default=None):
    if not name.isidentifier():
        raise ValueError(f"Not a valid identifier: {name!r}")
    return getattr(obj, name, default)

# isascii, isprintable, isspace
print("hello".isascii())      # True
print("héllo".isascii())      # False
print("hello\n".isprintable())  # False (\n not printable)
print("   ".isspace())        # True
print("".isspace())           # False (empty always False)`
},

"strings::t-strings (3.14+)": {
  summary: "Template string literals (<code>t-strings</code>, PEP 750, Python 3.14+) use the <code>t''</code> prefix and look like f-strings but produce a <code>string.templatelib.Template</code> object instead of a string. The <code>Template</code> has two attributes: <code>.strings</code> (the static string parts as a tuple) and <code>.interpolations</code> (the dynamic expression results). This separation lets libraries process templates safely before rendering — enabling SQL injection prevention, auto-HTML-escaping, localisation, and structured logging without string concatenation hacks.",
  when_to_use: "Use t-strings when the template consumer (a web framework, ORM, logger) needs to see the raw structure — expressions and literal parts separately — before deciding how to render. Unlike f-strings, t-strings are not eagerly rendered, so a library can sanitise or escape interpolated values. For simple string formatting where no special handling is needed, f-strings are still preferred.",
  gotchas: ["t-strings require Python 3.14+ — they cannot be polyfilled or backported", "A t-string is NOT a string — you cannot pass it to functions expecting <code>str</code> directly; it must be processed by a library or explicitly rendered"],
  example: `# Python 3.14+ only — t-string basics
from string.templatelib import Template

name = "Alice"
greeting = t"Hello, {name}!"       # Template object, not a string
print(type(greeting))               # <class 'string.templatelib.Template'>
print(greeting.strings)            # ('Hello, ', '!')
print(greeting.interpolations[0].value)  # 'Alice'

# t-strings separate structure from rendering
# A library can inspect and sanitise before rendering
def html_render(template: Template) -> str:
    import html
    parts = []
    strings = iter(template.strings)
    parts.append(next(strings))
    for interp, static in zip(template.interpolations, strings):
        # Auto-escape interpolated values
        parts.append(html.escape(str(interp.value)))
        parts.append(static)
    return "".join(parts)

user_input = "<script>alert('xss')</script>"
safe_html = html_render(t"<p>Welcome, {user_input}!</p>")
print(safe_html)
# <p>Welcome, &lt;script&gt;alert('xss')&lt;/script&gt;!</p>

# f-string: equivalent but unsafe — renders immediately
# f"<p>Welcome, {user_input}!</p>"  → XSS vulnerability!`
},

};

