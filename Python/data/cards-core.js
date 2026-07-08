// Python Cheatsheet — cards-core.js
// Auto-split from cards.js by page

window.CARD_DATA_CORE = {

"types & literals::numeric types": {
  summary: "Python has three numeric types: §c§int§/c§ (arbitrary precision), §c§float§/c§ (IEEE 754 double), and §c§complex§/c§ (a+bj). Integers never overflow. Floats use C §c§double§/c§ — see §c§sys.float_info§/c§ for platform precision. §c§int§/c§ has additional methods: §c§bit_length()§/c§ (bits needed to represent the value), §c§bit_count()§/c§ (Python 3.10, popcount of 1-bits), and §c§to_bytes()§/c§/§c§from_bytes()§/c§ for binary conversion. §c§float()§/c§ accepts §c§'nan'§/c§, §c§'inf'§/c§, and §c§'-inf'§/c§ as string inputs. Use §c§Decimal§/c§ for exact decimal arithmetic (money); §c§Fraction§/c§ for exact rational arithmetic.",
  when_to_use: "Use §c§int§/c§ for counts and indices. Use §c§float§/c§ for scientific/engineering work where approximation is fine. Use §c§Decimal§/c§ for financial calculations. Use §c§math.isclose(a, b, rel_tol=1e-9)§/c§ for float comparisons — never §c§a == b§/c§.",
  gotchas: ["§c§0.1 + 0.2 == 0.3§/c§ is §c§False§/c§ — float arithmetic is not exact. Use §c§math.isclose(a, b)§/c§", "§c§round()§/c§ uses banker's rounding (half-to-even): §c§round(0.5) == 0§/c§, §c§round(1.5) == 2§/c§, §c§round(2.5) == 2§/c§. Use §c§Decimal§/c§ with §c§ROUND_HALF_UP§/c§ for traditional rounding", "Integer division §c§//§/c§ floors toward negative infinity: §c§-7 // 2 == -4§/c§, not §c§-3§/c§"],
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
  summary: "§c§bool§/c§ is a subclass of §c§int§/c§: §c§True == 1§/c§, §c§False == 0§/c§. §c§None§/c§ is a singleton. Truthiness is determined by §c§__bool__()§/c§ (returns False) or §c§__len__()§/c§ (returns 0) — any object not implementing either is truthy by default. Falsy values: §c§None§/c§, §c§False§/c§, §c§0§/c§, §c§0.0§/c§, §c§0j§/c§, §c§Decimal(0)§/c§, §c§Fraction(0,1)§/c§, §c§''§/c§, §c§[]§/c§, §c§{}§/c§, §c§set()§/c§, §c§range(0)§/c§. Boolean operators §c§or§/c§/§c§and§/c§ return one of their operands, not necessarily §c§True§/c§/§c§False§/c§ — this enables the §c§x = val or default§/c§ pattern.",
  when_to_use: "Always use §c§is None§/c§ / §c§is not None§/c§ — never §c§== None§/c§ (any class can override §c§__eq__§/c§). Use bare truthiness §c§if items:§/c§ instead of §c§if len(items) > 0:§/c§. Use §c§bool(x)§/c§ to explicitly convert.",
  gotchas: ["§c§bool§/c§ inherits from §c§int§/c§: §c§True + True == 2§/c§, §c§sum([True, False, True]) == 2§/c§", "§c§or§/c§/§c§and§/c§ return an operand, not a bool: §c§'a' or 'b'§/c§ returns §c§'a'§/c§, §c§0 or 'b'§/c§ returns §c§'b'§/c§. Use §c§bool(x or y)§/c§ if you need an actual bool", "Empty numpy arrays raise §c§ValueError§/c§ on truthiness — use §c§arr.size§/c§ or §c§len(arr)§/c§ instead"],
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
  summary: "Python's built-in conversion functions: §c§int()§/c§, §c§float()§/c§, §c§str()§/c§, §c§bool()§/c§, §c§list()§/c§, §c§tuple()§/c§, §c§set()§/c§, §c§dict()§/c§, §c§bytes()§/c§, §c§chr()§/c§/§c§ord()§/c§. These call the type's constructor. §c§repr()§/c§ gives a developer-oriented string; §c§str()§/c§ gives a user-friendly string.",
  when_to_use: "Use §c§int(x, base)§/c§ to parse hex/octal/binary strings. Use §c§list()§/c§ to materialise any iterable. Use §c§frozenset()§/c§ when you need a hashable set. Use §c§bytes(n)§/c§ for n zero bytes, §c§bytes(iterable)§/c§ from int list, §c§bytes(string, encoding)§/c§ to encode.",
  gotchas: ["§c§int(3.9)§/c§ truncates toward zero — result is §c§3§/c§ not §c§4§/c§. Use §c§round()§/c§ for rounding", "§c§bool('False')§/c§ is §c§True§/c§ — any non-empty string is truthy. Parse booleans explicitly"],
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
  summary: "Python strings are immutable Unicode sequences. f-strings (PEP 498, Python 3.6+) are the fastest and most readable way to interpolate values. Python 3.12 (PEP 701) lifted historic f-string restrictions: backslashes, same-quote strings, and multi-line expressions are now allowed inside §c§{}§/c§. The format spec mini-language controls width, precision, alignment, and numeric formatting. §c§f'{x=}'§/c§ (Python 3.8+) prints both name and value — invaluable for debugging.",
  when_to_use: "Use f-strings for all new string interpolation. Use §c§str.format_map(mapping)§/c§ for template-based formatting from a dict. Use §c§textwrap.dedent()§/c§ with triple-quoted strings to strip leading indentation. Use §c§string.Template§/c§ for user-facing templates (safe: no arbitrary expressions).",
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
  summary: "Python strings have a rich set of built-in methods (all return new strings — strings are immutable). Key groups: case (§c§upper§/c§, §c§lower§/c§, §c§title§/c§, §c§casefold§/c§), search (§c§find§/c§, §c§index§/c§, §c§startswith§/c§, §c§endswith§/c§, §c§count§/c§), transform (§c§replace§/c§, §c§strip§/c§, §c§split§/c§, §c§join§/c§, §c§splitlines§/c§), split-once (§c§partition§/c§ / §c§rpartition§/c§). §c§casefold()§/c§ is a more aggressive lowercase suitable for case-insensitive comparisons (e.g. German §c§ß§/c§ → §c§ss§/c§). §c§partition(sep)§/c§ always returns a 3-tuple §c§(before, sep, after)§/c§ — even on no-match, where sep and after are empty strings. §c§splitlines()§/c§ handles all Unicode line endings (§c§\n§/c§, §c§\r\n§/c§, §c§\r§/c§, §c§\x0b§/c§, etc.) — more correct than §c§split('\n')§/c§ for cross-platform text.",
  when_to_use: "Use §c§'sep'.join(list)§/c§ for concatenation in loops — it's O(n) total vs O(n²) for §c§+=§/c§. Use §c§str.partition(sep)§/c§ to split exactly once into (before, sep, after). Use §c§str.translate()§/c§ with §c§str.maketrans()§/c§ for bulk single-char replacement.",
  gotchas: ["§c§lstrip(chars)§/c§ treats its argument as a <strong>set of characters</strong> to remove, not a prefix string — §c§'test_foo'.lstrip('test_')§/c§ removes all t/e/s/t/_ chars, not just the prefix §c§'test_'§/c§. Use §c§removeprefix()§/c§ for exact prefix removal", "§c§str.split()§/c§ with no args splits on any whitespace and removes empty strings; §c§str.split(' ')§/c§ with a space preserves empty strings between consecutive spaces", "§c§casefold()§/c§ is stronger than §c§lower()§/c§ for Unicode case-insensitive comparison — prefer it for comparing user input"],
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
  summary: "Lists are mutable, ordered sequences: O(1) index access and §c§append§/c§; O(n) §c§insert§/c§/§c§remove§/c§/§c§pop(i)§/c§. §c§list.sort()§/c§ and §c§sorted()§/c§ use <strong>Powersort</strong> (Python 3.11+, replaced Timsort) — a stable, adaptive merge sort. Stable means equal elements keep their original relative order. The §c§key=§/c§ parameter takes a function applied to each element for comparison purposes only — the original elements are returned in sorted order, not the key values. §c§*§/c§ unpacking in assignments and literals; extended unpacking with §c§*rest§/c§.",
  when_to_use: "Use §c§list.sort()§/c§ (in-place) vs §c§sorted()§/c§ (new list). Use §c§deque§/c§ for queues — §c§list.pop(0)§/c§ is O(n). Use §c§bisect§/c§ for binary search and insertion into sorted lists. Use §c§*§/c§ unpacking in literals to merge lists.",
  gotchas: ["§c§[[]] * n§/c§ creates n references to the same inner list — use §c§[[] for _ in range(n)]§/c§", "§c§list.sort()§/c§ mutates in place and returns §c§None§/c§; §c§sorted()§/c§ returns a new list — assigning §c§lst = lst.sort()§/c§ sets lst to None", "Python 3.11+ uses Powersort (not Timsort) — but stability is still guaranteed by the language spec, not just CPython"],
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
  summary: "Tuples are immutable, ordered sequences. Immutability makes them hashable (usable as dict keys / set elements). Slightly faster to create and iterate than lists. Key use: return multiple values, heterogeneous fixed-structure records, dict keys. §c§typing.NamedTuple§/c§ adds field names and type hints. §c§collections.namedtuple§/c§ is the older alternative.",
  when_to_use: "Use tuples for heterogeneous fixed-structure data (like a DB row). Use as dict keys for compound keys: §c§{(x, y): value}§/c§. Return multiple values as tuples from functions. Use §c§typing.NamedTuple§/c§ for structured named records — it's self-documenting.",
  gotchas: ["Single-element tuple requires trailing comma: §c§(42,)§/c§ not §c§(42)§/c§. §c§(42)§/c§ is just the integer in parentheses", "Tuples are immutable but mutable objects inside can still be mutated: §c§t = ([1,2],); t[0].append(3)§/c§ works"],
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
  summary: "§c§set§/c§ is an unordered, mutable collection of unique hashable objects backed by a hash table. Average O(1) for add, remove, and §c§in§/c§. Supports math set ops: union §c§|§/c§, intersection §c§&§/c§, difference §c§-§/c§, symmetric difference §c§^§/c§. §c§issubset()§/c§/§c§issuperset()§/c§ (or §c§<=§/c§/§c§>=§/c§); §c§isdisjoint(other)§/c§ returns §c§True§/c§ if no elements in common — faster than §c§len(a & b) == 0§/c§ because it short-circuits. §c§frozenset§/c§ is the immutable, hashable version — usable as dict key or set element.",
  when_to_use: "Use sets for fast membership testing (O(1) vs O(n) for lists). Use for deduplication. Use for set arithmetic (intersection, difference). Use §c§frozenset§/c§ when you need a hashable set.",
  gotchas: ["§c§{}§/c§ creates an empty §c§dict§/c§, NOT an empty §c§set§/c§. Use §c§set()§/c§ for empty sets", "Sets are unordered — don't rely on iteration order. For ordered uniqueness, use §c§dict.fromkeys(items)§/c§ (preserves insertion order in Python 3.7+)"],
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
  summary: "Dicts are mutable mappings with average O(1) get/set/delete. Python 3.7+ guarantees insertion-order preservation. Creation: literals §c§{}§/c§, §c§dict()§/c§, comprehensions, §c§dict.fromkeys()§/c§. Merge operator §c§|§/c§ (Python 3.9+) creates a new merged dict (right side wins on conflict). Update operator §c§|=§/c§ (Python 3.9+) merges in-place. §c§dict.get(key, default)§/c§ avoids §c§KeyError§/c§. §c§dict.setdefault(key, default)§/c§ initialises missing keys in-place. Dict views (§c§keys()§/c§, §c§values()§/c§, §c§items()§/c§) are live windows and support set-like operations.",
  when_to_use: "Use §c§dict.get()§/c§ when a missing key is expected and not an error. Use §c§dict.setdefault()§/c§ to initialise accumulator patterns. Use §c§collections.defaultdict§/c§ for auto-initialised missing keys. Use the §c§|§/c§ operator (Python 3.9+) or §c§{**d1, **d2}§/c§ to merge dicts.",
  gotchas: ["Dict keys must be hashable — lists and dicts cannot be keys", "Mutating a dict while iterating it raises §c§RuntimeError§/c§ — iterate over §c§list(d.items())§/c§ if you need to delete during iteration"],
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
  summary: "§c§collections.defaultdict§/c§ auto-creates values via a factory. §c§Counter§/c§ counts hashable objects, supports arithmetic (+, -, &, |) and §c§most_common(n)§/c§. §c§ChainMap§/c§ layers multiple dicts without merging. Dict views (§c§keys()§/c§, §c§values()§/c§, §c§items()§/c§) are live dynamic windows — changes to the dict are immediately reflected. §c§dict.keys()§/c§ and §c§dict.items()§/c§ support set-like operations: §c§d1.keys() & d2.keys()§/c§ finds common keys; §c§d1.keys() - d2.keys()§/c§ finds keys only in d1.",
  when_to_use: "Use §c§Counter§/c§ for any frequency-counting task — its arithmetic operators combine counts cleanly. Use §c§defaultdict(list)§/c§ for grouping. Use §c§ChainMap§/c§ for configuration layering (user overrides > env > defaults) without copying.",
  gotchas: ["§c§Counter§/c§ returns 0 for missing keys — it won't raise §c§KeyError§/c§. This is convenient but can mask typos in key names", "§c§dict.items()§/c§, §c§.keys()§/c§, §c§.values()§/c§ return view objects that reflect current state — wrap in §c§list()§/c§ for a snapshot"],
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
  summary: "§c§if/elif/else§/c§, §c§for§/c§, §c§while§/c§, §c§break§/c§, §c§continue§/c§, loop §c§else§/c§ (runs if no §c§break§/c§). Python 3.10+ adds structural pattern matching with §c§match/case§/c§. §c§range§/c§ is a full sequence type, not just a loop construct: it supports §c§in§/c§ (O(1) membership test — not a scan), slicing, §c§len()§/c§, §c§index()§/c§, and §c§count()§/c§. §c§enumerate()§/c§ and §c§zip()§/c§ are the idiomatic loop helpers. §c§zip(strict=True)§/c§ (Python 3.10+) raises §c§ValueError§/c§ if iterables have different lengths — use this when they should be the same length.",
  when_to_use: "Use §c§for/else§/c§ to detect 'completed without finding anything' without a flag variable. Use §c§enumerate(start=1)§/c§ instead of manual counters. Use §c§zip(strict=True)§/c§ (Python 3.10+) to catch length mismatches. Use §c§match/case§/c§ for complex structural dispatch instead of isinstance chains.",
  gotchas: ["The loop §c§else§/c§ clause runs when the loop finishes WITHOUT a §c§break§/c§ — many developers find this confusing; add a comment", "Mutating a list during §c§for x in lst:§/c§ can skip elements — iterate over §c§lst[:]§/c§ or collect mutations separately"],
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
  summary: "Python supports 5 parameter types: positional, §c§*args§/c§, keyword-only (after bare §c§*§/c§), §c§**kwargs§/c§, positional-only (before §c§/§/c§, Python 3.8+). Default values are evaluated once at definition — mutable defaults are a classic bug. Closures capture variables by reference. §c§functools.partial§/c§ creates partially-applied functions.",
  when_to_use: "Use bare §c§*§/c§ to force keyword-only arguments. Use §c§/§/c§ to make parameters positional-only. Use §c§nonlocal§/c§ to rebind (not just mutate) enclosing scope variables. Use §c§operator.itemgetter§/c§/§c§attrgetter§/c§ as faster, cleaner alternatives to lambdas in sort keys.",
  gotchas: ["Mutable default argument bug: §c§def f(lst=[])§/c§ — all calls share the same list. Fix: §c§def f(lst=None): lst = lst or []§/c§", "Loop closure bug: lambdas in a loop all capture the same variable. Fix: use default arg §c§lambda x, i=i: x*i§/c§"],
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
  summary: "Comprehensions create containers concisely. List: §c§[expr for x in it if cond]§/c§. Dict: §c§{k:v for ...}§/c§. Set: §c§{expr for ...}§/c§. Generator: §c§(expr for ...)§/c§ — lazy, O(1) memory, single-use. Multiple §c§for§/c§ clauses nest like nested loops. §c§yield from§/c§ delegates to a sub-generator.",
  when_to_use: "Use comprehensions for simple transforms/filters. Use generator expressions when iterating once over large data — no list built in memory. Pass generator expressions directly to aggregation functions: §c§sum(x**2 for x in range(n))§/c§. Avoid deeply nested comprehensions — extract to functions.",
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
  summary: "§c§try/except/else/finally§/c§: §c§else§/c§ runs only if no exception was raised; §c§finally§/c§ always runs. Catch the most specific exception type. Use §c§raise X from Y§/c§ for exception chaining. Python 3.11+ (PEP 654) adds §c§ExceptionGroup§/c§ and §c§except*§/c§ for handling multiple concurrent exceptions — the primary use case is §c§asyncio.TaskGroup§/c§, which raises an §c§ExceptionGroup§/c§ when tasks fail. Python 3.11+ also adds §c§exception.add_note()§/c§ to attach extra context to exceptions.",
  when_to_use: "Use §c§else§/c§ to distinguish 'code that may raise' from 'code that runs on success'. Use §c§finally§/c§ for releasing resources. Use §c§contextlib.suppress(ExcType)</code} to silently ignore specific exceptions. Create exception hierarchies so callers can catch broadly or narrowly.",
  gotchas: ["Re-raise with bare §c§raise§/c§, not §c§raise e§/c§ — bare raise preserves the original traceback", "Catching bare §c§Exception§/c§ is usually fine; never catch bare §c§BaseException§/c§ (it would swallow §c§KeyboardInterrupt§/c§)"],
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
  summary: "Always use §c§with open()§/c§ — it ensures the file closes even on exceptions. Mode strings: §c§'r'§/c§ read text, §c§'w'§/c§ write (truncate), §c§'a'§/c§ append, §c§'b'§/c§ binary, §c§'+'§/c§ read+write. Always specify §c§encoding='utf-8'§/c§ for text files. Context managers use §c§__enter__§/c§/§c§__exit__§/c§. Use §c§@contextmanager§/c§ for simple generator-based CMs.",
  when_to_use: "Iterate the file object line-by-line for large files — avoids loading into memory. Use §c§pathlib.Path.read_text()§/c§/§c§write_text()§/c§ for small files. Use §c§contextlib.ExitStack§/c§ when the number of context managers is dynamic. Use §c§io.StringIO§/c§/§c§BytesIO§/c§ as in-memory file objects for testing.",
  gotchas: ["Omitting §c§encoding=§/c§ uses the system default — on Windows this is often §c§cp1252§/c§, causing §c§UnicodeDecodeError§/c§ on UTF-8 files", "If §c§__exit__§/c§ returns a truthy value, the exception is suppressed — rarely what you want"],
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
  summary: "Key built-ins: §c§len§/c§, §c§range§/c§, §c§enumerate§/c§, §c§zip§/c§, §c§map§/c§, §c§filter§/c§, §c§sorted§/c§, §c§reversed§/c§, §c§sum§/c§, §c§min§/c§/§c§max§/c§, §c§abs§/c§, §c§round§/c§, §c§any§/c§/§c§all§/c§, §c§isinstance§/c§, §c§getattr§/c§/§c§setattr§/c§/§c§hasattr§/c§, §c§vars§/c§, §c§dir§/c§, §c§id§/c§, §c§type§/c§, §c§callable§/c§. Walrus operator §c§:=§/c§ assigns in expressions (Python 3.8+).",
  when_to_use: "Use §c§isinstance(x, (TypeA, TypeB))§/c§ for multi-type checks. Use §c§any()§/c§/§c§all()§/c§ with generators for short-circuit evaluation. Use §c§getattr(obj, name, default)§/c§ for safe dynamic attribute access. Use chained comparisons §c§0 < x < 10§/c§ (unique to Python).",
  gotchas: ["§c§zip()§/c§ stops at the shortest iterable — use §c§itertools.zip_longest()§/c§ for all elements", "Walrus §c§:=§/c§ needs parentheses when used as a standalone expression in §c§if§/c§ — e.g. §c§if (n := len(a)) > 10:§/c§"],
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

// PAGE 2 — ADVANCED PYTHON,

"strings::slicing & translate": {
  summary: "String slicing uses §c§[start:stop:step]§/c§. All indices can be negative (counting from end). Step §c§-1§/c§ reverses the string. §c§str.translate()§/c§ with §c§str.maketrans()§/c§ is the fastest way to do bulk single-character replacement — much faster than multiple §c§replace()§/c§ calls.",
  when_to_use: "Use slicing with step for reversals and sampling. Use §c§str.translate()§/c§ + §c§str.maketrans()§/c§ for bulk char replacement or removal (e.g. stripping punctuation). Use §c§'sub' in s§/c§ for simple membership checks.",
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
  summary: "The §c§*§/c§ repetition operator on a list containing a mutable object creates multiple references to the SAME inner object. §c§[[]] * 3§/c§ gives three references to one list — mutating any one mutates all. Use a list comprehension for independent rows.",
  when_to_use: "Always use §c§[default for _ in range(n)]§/c§ when initialising with mutable defaults. For 2D grids use §c§[[0]*cols for _ in range(rows)]§/c§. The §c§*§/c§ trick is fine for IMMUTABLE defaults like integers: §c§[0] * 10§/c§ is correct.",
  gotchas: ["§c§[[]] * n§/c§ looks correct but all rows are the same object in memory", "The same trap applies to dicts, sets, and any mutable default value"],
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
  summary: "The walrus operator §c§:=§/c§ (PEP 572, Python 3.8+) assigns and returns a value in a single expression. Most useful in §c§while§/c§ loops reading streams and comprehension filters where you need the computed value. The ternary operator §c§a if cond else b§/c§ is Python's inline conditional.",
  when_to_use: "Use §c§while chunk := f.read(8192):§/c§ to avoid read-then-check patterns. Use in comprehensions to compute a value once and both filter and use it. Use ternary for simple inline conditionals.",
  gotchas: ["Walrus needs parentheses in some contexts: §c§if (n := len(a)) > 10:§/c§", "Ternary has lower precedence than most operators: §c§x = a + b if cond else c§/c§ parses as §c§x = (a+b) if cond else c§/c§"],
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

"control flow::advanced match / case": {
  summary: "Structural pattern matching (§c§match§/c§/§c§case§/c§, Python 3.10+, PEP 634) goes far beyond switch/case. "
    + "Pattern types: <strong>literal</strong> (§c§case 404§/c§), <strong>capture</strong> (§c§case x§/c§ — binds to §c§x§/c§), "
    + "<strong>wildcard</strong> (§c§case _§/c§ — matches anything, binds nothing), "
    + "<strong>sequence</strong> (§c§case [x, y]§/c§ or §c§case [first, *rest]§/c§), "
    + "<strong>mapping</strong> (§c§case {'action': a}§/c§ — extra keys ignored by default), "
    + "<strong>class</strong> (§c§case Point(x=0, y=y)§/c§ — matches instances and destructures attributes), "
    + "<strong>OR</strong> (§c§case 400 | 401 | 403§/c§), "
    + "<strong>AS</strong> (§c§case [x, y] as point§/c§ — bind the whole match). "
    + "A <strong>guard</strong> (§c§case pattern if condition§/c§) adds an extra boolean check after the pattern matches. "
    + "Name bindings from a successful pattern are available after the §c§match§/c§ block. "
    + "A bare name like §c§case x§/c§ is always a <em>capture</em>, not a value comparison — use dotted names (§c§case Status.OK§/c§) or literals for value checks.",
  when_to_use: "Use §c§match§/c§/§c§case§/c§ instead of long §c§if/elif§/c§ chains when branching on structure, not just equality. "
    + "Use class patterns to replace §c§isinstance§/c§ + attribute access in one step. "
    + "Use sequence patterns to destructure lists/tuples. "
    + "Use guards for range checks or conditions that can't be expressed in the pattern alone.",
  gotchas: ["A bare name in a pattern (§c§case x§/c§) is a <em>capture</em> — it always matches and binds. To match a variable's VALUE use a dotted name (§c§case Color.RED§/c§) or a literal", "Sequence patterns match any sequence (list, tuple) but NOT strings, bytes, or dicts — those use literal or mapping patterns", "Guards (§c§if condition§/c§) only run after the pattern already matches — if the guard fails, the next case is tried"],
  example: `from dataclasses import dataclass

@dataclass
class Point:  x: float; y: float

@dataclass
class Circle: center: Point; radius: float

def describe(shape):
    match shape:
        # Class pattern — destructures attributes
        case Circle(center=Point(x=0, y=0), radius=r):
            return f"Circle at origin, r={r}"

        # Class pattern + guard
        case Circle(radius=r) if r < 0:
            raise ValueError("negative radius")

        # Sequence pattern with *rest capture
        case [first, *rest]:
            return f"list: first={first}, rest={rest}"

        # Mapping pattern — extra keys ignored
        case {"action": action, "value": value}:
            return f"action={action} value={value}"

        # OR pattern
        case 400 | 401 | 403:
            return "auth error"

        # AS pattern — bind the whole match
        case [x, y] as point:
            return f"2-element sequence bound to {point}"

        # Wildcard — must be last
        case _:
            return "unknown"

print(describe(Circle(Point(0,0), 5)))  # Circle at origin, r=5
print(describe([1, 2, 3, 4]))           # list: first=1, rest=[2,3,4]
print(describe({"action":"save","value":42,"extra":True}))  # action=save value=42

# Guards — extra condition after pattern match
def classify(value):
    match value:
        case int(n) if n < 0:  return "negative int"
        case int(n) if n == 0: return "zero"
        case int(n):           return f"positive int: {n}"
        case str(s) if s.isupper(): return "UPPERCASE"
        case str(s):           return f"string: {s}"`
},

"functions::closures & higher-order": {
  summary: "A closure captures variables from its enclosing scope by reference, not by value. §c§nonlocal§/c§ is required to rebind (not just mutate) an enclosing variable. Higher-order functions accept or return functions. §c§operator.itemgetter§/c§ / §c§attrgetter§/c§ are faster, cleaner sort-key alternatives to lambdas.",
  when_to_use: "Use closures to create function factories. Use §c§nonlocal§/c§ when a closure needs to reassign an enclosing variable. Prefer named functions over complex lambdas for readability.",
  gotchas: ["Loop closure bug: all functions in a loop capture the same variable by reference. Fix with a default argument: §c§lambda x, i=i: x*i§/c§", "Without §c§nonlocal§/c§, assigning to an enclosing variable creates a new local instead of updating the enclosing one"],
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
  summary: "Generator expressions §c§(expr for x in iter)§/c§ produce values lazily — one at a time — using O(1) memory regardless of input size. They are single-use. §c§yield§/c§ turns a function into a generator. §c§yield from§/c§ delegates to a sub-generator and correctly propagates §c§send()§/c§ and §c§throw()§/c§.",
  when_to_use: "Use generator expressions when iterating once over large data. Pass directly to aggregators: §c§sum(x**2 for x in range(n))§/c§. Use §c§yield from§/c§ instead of a for-loop to delegate to sub-generators.",
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
  summary: "Custom exceptions should inherit from §c§Exception§/c§ or a specific subclass. Adding §c§__init__§/c§ allows structured error data. Exception chaining with §c§raise X from Y§/c§ preserves the root cause. §c§raise X from None§/c§ suppresses the original context. Python 3.11+ adds §c§exception.add_note()§/c§.",
  when_to_use: "Create exception hierarchies for libraries so callers can catch broadly or specifically. Use §c§raise ... from original§/c§ when wrapping lower-level exceptions. Use §c§raise ... from None§/c§ when the internal cause would confuse users.",
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
  summary: "Always use §c§with open()§/c§ — ensures the file closes even on exceptions. Mode strings: §c§'r'§/c§ read text, §c§'w'§/c§ write (truncate), §c§'a'§/c§ append, §c§'b'§/c§ binary. Always specify §c§encoding='utf-8'§/c§ for text files. Iterate the file object line-by-line for large files to avoid loading everything into memory.",
  when_to_use: "Iterate §c§for line in f:§/c§ for large files. Use §c§pathlib.Path.read_text()§/c§/§c§write_text()§/c§ for small files. Use §c§io.StringIO§/c§/§c§io.BytesIO§/c§ as in-memory file objects in tests.",
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
  summary: "Context managers implement §c§__enter__§/c§/§c§__exit__§/c§. §c§@contextlib.contextmanager§/c§ creates CMs from generator functions with §c§yield§/c§. §c§@asynccontextmanager§/c§ (Python 3.10+ as decorator) is the async equivalent for §c§async with§/c§. §c§contextlib.nullcontext()§/c§ (Python 3.10+) is a no-op CM — useful as a stand-in for an optional CM. §c§ExitStack§/c§ handles a dynamic number of CMs. §c§suppress(ExcTypes...)§/c§ silently ignores specified exceptions. LIFO exit order: with §c§a, b§/c§ — §c§b§/c§ exits before §c§a§/c§.",
  when_to_use: "Use §c§@contextmanager§/c§ for lightweight CMs without writing a full class. Use §c§ExitStack§/c§ when the number of resources is not known at write time. Use §c§suppress§/c§ instead of empty try/except blocks.",
  gotchas: ["If §c§__exit__§/c§ returns a truthy value the exception is suppressed — rarely intentional", "LIFO exit order: with §c§a, b§/c§ — §c§b§/c§ exits before §c§a§/c§"],
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
  summary: "Python built-ins are always available without imports. Key: §c§len§/c§, §c§range§/c§, §c§enumerate§/c§, §c§zip§/c§, §c§map§/c§, §c§filter§/c§, §c§sorted§/c§, §c§reversed§/c§, §c§sum§/c§, §c§min§/c§/§c§max§/c§, §c§abs§/c§, §c§round§/c§, §c§any§/c§/§c§all§/c§, §c§isinstance§/c§, §c§getattr§/c§/§c§setattr§/c§/§c§hasattr§/c§, §c§vars§/c§, §c§dir§/c§, §c§type§/c§, §c§callable§/c§. §c§zip(strict=True)§/c§ (Python 3.10+) raises §c§ValueError§/c§ if iterables differ in length. §c§iter(callable, sentinel)§/c§ — two-argument form calls callable with no args until sentinel is returned; classic use: §c§iter(partial(f.read, 8192), b'')§/c§. §c§breakpoint()§/c§ (Python 3.7+) drops into the debugger at the call site; respects §c§PYTHONBREAKPOINT§/c§ env var. §c§round()§/c§ uses banker's rounding (half-to-even) — §c§round(0.5) == 0§/c§.",
  when_to_use: "Use §c§isinstance(x, (A, B))§/c§ for multi-type checks. Use §c§any()§/c§ / §c§all()§/c§ with generators for short-circuit evaluation. Use §c§getattr(obj, name, default)§/c§ for safe dynamic attribute access. Use §c§vars(obj)§/c§ to introspect instance dicts.",
  gotchas: ["§c§zip()§/c§ stops at the shortest iterable — use §c§itertools.zip_longest()§/c§ to pad to the longest", "§c§sorted()§/c§ returns a new list; §c§reversed()§/c§ returns a lazy iterator — wrap in §c§list()§/c§ if needed", "§c§round()§/c§ uses banker's rounding (half-to-even): §c§round(0.5) == 0§/c§, §c§round(1.5) == 2§/c§, §c§round(2.5) == 2§/c§"],
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


"strings::format spec mini-language": {
  summary: "The format spec mini-language controls how values render inside f-strings, §c§str.format()§/c§, and §c§format()§/c§. "
    + "Full grammar: §c§[[fill]align][sign][#][0][width][grouping][.precision][type]§/c§. "
    + "Alignment: §c§&lt;§/c§ left, §c§&gt;§/c§ right, §c§^§/c§ centre, §c§=§/c§ pad after sign. "
    + "A fill character can precede the alignment (e.g. §c§*^20§/c§ centres in 20 cols padded with §c§*§/c§). "
    + "Sign: §c§+§/c§ always show, §c§-§/c§ only negatives (default), space for a leading space on positives. "
    + "§c§#§/c§ adds §c§0x§/c§/§c§0o§/c§/§c§0b§/c§ prefixes. "
    + "Grouping: §c§,§/c§ or §c§_§/c§ as thousands separator. "
    + "§c§.precision§/c§ sets decimal places (§c§f§/c§) or max string length. "
    + "Type: §c§f§/c§ fixed, §c§e§/c§ scientific, §c§%§/c§ percentage, §c§d/b/o/x§/c§ int bases, §c§g§/c§ general.",
  when_to_use: "Use f-strings (§c§f\"{x:.2f}\"§/c§) for almost all formatting — fastest and most readable. "
    + "Use §c§{x:,}§/c§ for thousands separators in reports. "
    + "Use §c§{x:.1%}§/c§ to render ratios as percentages. "
    + "Use §c§{x:>10}§/c§ / §c§{x:<10}§/c§ for aligned columnar output. "
    + "Use §c§{x=}§/c§ (Python 3.8+) for debug output showing both name and value. "
    + "Nested fields let width/precision come from variables: §c§f\"{x:{w}.{p}f}\"§/c§.",
  gotchas: ["§c§=§/c§ alignment (pad after sign) only works for numeric types — using it on a string raises §c§ValueError§/c§", "§c§{x:%}§/c§ multiplies by 100 AND appends §c§%§/c§ — §c§f\"{0.5:%}\"§/c§ gives §c§50.000000%§/c§, not §c§0.5%§/c§. Use §c§{x:.1%}§/c§ to control decimals", "Zero-padding with §c§0§/c§ before width is sign-aware: §c§f\"{-5:05d}\"§/c§ gives §c§-0005§/c§, keeping the sign outside the padding"],
  example: `# ── Alignment & fill (width = 12) ────────────────────
print(f"{'left':<12}|")     # "left        |"
print(f"{'right':>12}|")    # "       right|"
print(f"{'mid':^12}|")      # "    mid     |"
print(f"{'pad':*^12}|")     # "****pad*****|"

# ── Numbers: precision, sign, grouping ───────────────
pi = 3.14159265
print(f"{pi:.2f}")          # "3.14"
print(f"{pi:.4f}")          # "3.1416"
print(f"{pi:+.2f}")         # "+3.14"  (always sign)
print(f"{1234567:,}")       # "1,234,567"
print(f"{1234567:_}")       # "1_234_567"
print(f"{1234.5:>12,.2f}")  # "    1,234.50"

# ── Percentages ──────────────────────────────────────
print(f"{0.8734:.1%}")      # "87.3%"
print(f"{0.05:.2%}")        # "5.00%"

# ── Integer bases (with # for prefix) ────────────────
n = 255
print(f"{n:d} {n:x} {n:o} {n:b}")    # "255 ff 377 11111111"
print(f"{n:#x} {n:#o} {n:#b}")       # "0xff 0o377 0b11111111"
print(f"{n:08b}")                    # "11111111" (zero-padded to 8)

# ── Sign-aware zero padding ──────────────────────────
print(f"{42:05d}")          # "00042"
print(f"{-42:05d}")         # "-0042"  (sign kept outside pad)

# ── Debug (3.8+): shows name AND value ───────────────
x = 42; name = "Ada"
print(f"{x=}")              # "x=42"
print(f"{name=}")           # "name='Ada'"

# ── Nested fields — width/precision from variables ───
w, p = 10, 3
print(f"{pi:{w}.{p}f}")     # "     3.142"

# ── Dates via __format__ ─────────────────────────────
from datetime import datetime
now = datetime(2024, 11, 15, 9, 5)
print(f"{now:%Y-%m-%d %H:%M}")   # "2024-11-15 09:05"

# ── str.format() equivalents ─────────────────────────
print("{:>8} = {:.2f}".format("total", 3.14159))  # "   total = 3.14"
print("{0} {1} {0}".format("a", "b"))             # "a b a" (index reuse)`
},
"strings::bytes & encoding": {
  summary: "§c§bytes§/c§ is an immutable sequence of integers 0-255; §c§bytearray§/c§ is the mutable equivalent. "
    + "§c§str.encode(encoding, errors)§/c§ converts a string to bytes; §c§bytes.decode(encoding, errors)§/c§ converts back. "
    + "Default encoding is §c§UTF-8§/c§ — always specify it explicitly when reading/writing files or network data. "
    + "The §c§errors§/c§ parameter controls bad-character handling: §c§'strict'§/c§ (default, raises), §c§'ignore'§/c§, §c§'replace'§/c§ (inserts U+FFFD). "
    + "§c§io.BytesIO§/c§ is an in-memory binary stream — use it to treat bytes as a file without touching disk. "
    + "§c§struct.pack(fmt, ...)§/c§ / §c§struct.unpack(fmt, buf)§/c§ convert between Python values and packed binary data using C-style format strings.",
  when_to_use: "Use §c§bytes§/c§ for any binary data: files opened with §c§mode='rb'§/c§, network sockets, cryptography, image data. "
    + "Always decode to §c§str§/c§ as early as possible and encode back as late as possible — keep the core of your program as Unicode strings. "
    + "Use §c§BytesIO§/c§ to build or parse binary payloads in memory without temp files. "
    + "Use §c§struct§/c§ to parse binary protocols (headers, file formats) or interface with C libraries.",
  gotchas: ["§c§bytes§/c§ and §c§str§/c§ cannot be mixed — §c§'hello' + b' world'§/c§ raises §c§TypeError§/c§. Always encode/decode at the boundary", "Indexing a §c§bytes§/c§ object returns an §c§int§/c§, not a single-byte §c§bytes§/c§: §c§b'ABC'[0]§/c§ is §c§65§/c§, not §c§b'A'§/c§. Use §c§b'ABC'[0:1]§/c§ for the latter", "Specifying no encoding when reading a file uses the system default — on Windows this is often §c§cp1252§/c§, not UTF-8. Always pass §c§encoding='utf-8'§/c§"],
  example: `import io, struct

# ── str ↔ bytes encoding ──────────────────────────────
text = "héllo wörld"
b = text.encode("utf-8")         # str → bytes
print(b)                          # b'h\xc3\xa9llo...'
print(b.decode("utf-8"))          # bytes → str (original)

# errors parameter
b2 = "café".encode("ascii", errors="ignore")   # b'caf'
b3 = "café".encode("ascii", errors="replace")  # b'caf?'

# bytes literals and operations
data = b"\x00\x01\x02\xff"
print(data[0])           # 65  ← int, not bytes!
print(data[0:1])         # b'\x00'  ← slice for bytes
print(data.hex())        # '000102ff'
print(bytes.fromhex("deadbeef"))  # b'\xde\xad\xbe\xef'

# bytearray — mutable
buf = bytearray(b"hello")
buf[0] = ord('H')         # mutate in place
print(bytes(buf))         # b'Hello'

# io.BytesIO — in-memory binary file
stream = io.BytesIO()
stream.write(b"header")
stream.write(b"\x00\x01")
stream.seek(0)
print(stream.read(6))    # b'header'

# struct — pack/unpack binary data
# Format: '>' = big-endian, 'H' = uint16, 'f' = float32
packed = struct.pack(">Hf", 1024, 3.14)
print(len(packed))               # 6 bytes
magic, value = struct.unpack(">Hf", packed)
print(magic, round(value, 2))   # 1024  3.14

# Parsing a binary header (e.g. a simple file format)
header_fmt = ">4sHH"            # 4-char magic, 2 uint16s
header = struct.pack(header_fmt, b"PNG\x00", 640, 480)
magic, w, h = struct.unpack(header_fmt, header)
print(magic, w, h)              # b'PNG\x00' 640 480`
},

"strings::validation methods": {
  summary: "Python strings have ~15 §c§is*()§/c§ predicate methods for checking character content. Key distinctions: §c§isdecimal()§/c§ is the strictest — only ASCII 0-9 and Unicode decimal digits (e.g. Arabic-Indic numerals); §c§isdigit()§/c§ also accepts superscripts (§c§²§/c§, §c§³§/c§); §c§isnumeric()§/c§ is broadest — also accepts fractions, Roman numerals. For validating user-entered integers, §c§isdecimal()§/c§ is almost always what you want. §c§isidentifier()§/c§ checks if a string is a valid Python identifier — useful for dynamic attribute access and metaprogramming. §c§isascii()§/c§ (Python 3.7+) checks all characters are in the ASCII range 0-127.",
  when_to_use: "Use §c§isdecimal()§/c§ (not §c§isdigit()§/c§) when validating integer input — it rejects superscripts and other digit-like chars that §c§int()§/c§ would reject. Use §c§isidentifier()§/c§ to safely validate names before passing to §c§getattr()§/c§. Use §c§isascii()§/c§ to quickly check if a string needs Unicode handling.",
  gotchas: ["§c§'²'.isdigit()§/c§ is §c§True§/c§ but §c§int('²')§/c§ raises §c§ValueError§/c§ — §c§isdigit()§/c§ does not guarantee §c§int()§/c§ will succeed", "§c§''.isdecimal()§/c§ returns §c§False§/c§ for empty strings — all §c§is*§/c§ methods return §c§False§/c§ on empty strings"],
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
  summary: "Template string literals (§c§t-strings§/c§, PEP 750, Python 3.14+) use the §c§t''§/c§ prefix and look like f-strings but produce a §c§string.templatelib.Template§/c§ object instead of a string. The §c§Template§/c§ has two attributes: §c§.strings§/c§ (the static string parts as a tuple) and §c§.interpolations§/c§ (the dynamic expression results). This separation lets libraries process templates safely before rendering — enabling SQL injection prevention, auto-HTML-escaping, localisation, and structured logging without string concatenation hacks.",
  when_to_use: "Use t-strings when the template consumer (a web framework, ORM, logger) needs to see the raw structure — expressions and literal parts separately — before deciding how to render. Unlike f-strings, t-strings are not eagerly rendered, so a library can sanitise or escape interpolated values. For simple string formatting where no special handling is needed, f-strings are still preferred.",
  gotchas: ["t-strings require Python 3.14+ — they cannot be polyfilled or backported", "A t-string is NOT a string — you cannot pass it to functions expecting §c§str§/c§ directly; it must be processed by a library or explicitly rendered"],
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
}

};
