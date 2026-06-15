// Python Cheatsheet — cards-stdlib.js
// Auto-split from cards.js by page

window.CARD_DATA_STDLIB = {

"imports & packages::import system & packages": {
  summary: "Python's import system searches §c§sys.path§/c§ (built-ins → script dir → §c§PYTHONPATH§/c§ → site-packages). "
    + "A <strong>module</strong> is a single §c§.py§/c§ file; a <strong>package</strong> is a directory containing §c§__init__.py§/c§ (regular package) or no §c§__init__.py§/c§ (namespace package, PEP 420, Python 3.3+). "
    + "§c§__init__.py§/c§ runs when the package is first imported — use it to define the package's public API. "
    + "§c§__all__§/c§ controls what §c§from pkg import *§/c§ exports. "
    + "Relative imports use leading dots: §c§from . import sibling§/c§, §c§from .. import parent_item§/c§. "
    + "§c§importlib.import_module('pkg.mod')§/c§ imports dynamically by string name. "
    + "§c§importlib.reload(mod)§/c§ re-executes a module without restarting the interpreter. "
    + "Imported modules are cached in §c§sys.modules§/c§ — subsequent imports return the cached object. "
    + "§c§if __name__ == '__main__':§/c§ guards code that should only run when the file is executed directly.",
  when_to_use: "Use relative imports (§c§from . import§/c§) inside a package for intra-package references — they are refactor-safe (don't depend on the package name). "
    + "Use §c§importlib.import_module()§/c§ for plugin systems or any import driven by runtime data. "
    + "Use §c§__init__.py§/c§ to re-export internal symbols and keep the public API stable while reorganising internals. "
    + "Use §c§TYPE_CHECKING§/c§ guard imports to avoid circular imports at runtime: §c§if TYPE_CHECKING: from .models import User§/c§.",
  gotchas: ["Relative imports only work inside a package — running a file directly with §c§python pkg/mod.py§/c§ sets §c§__name__§/c§ to §c§'__main__'§/c§ and §c§__package__§/c§ to §c§None§/c§, so §c§from . import x§/c§ raises §c§ImportError§/c§. Run as §c§python -m pkg.mod§/c§ instead", "A file named the same as a stdlib module (e.g. §c§json.py§/c§ in your project root) will shadow the stdlib module — Python searches the script directory first", "§c§sys.modules§/c§ caching means mutating a module object affects all importers — use §c§importlib.reload()§/c§ only in development/REPL sessions"],
  example: `# ── Package layout ───────────────────────────────────
# myapp/
# ├── __init__.py          ← marks myapp as a package
# ├── utils.py
# ├── models/
# │   ├── __init__.py      ← re-exports for clean API
# │   └── user.py
# └── services/
#     └── auth.py

# myapp/__init__.py
from .utils import helper   # relative import
__all__ = ["helper"]        # controls "from myapp import *"

# myapp/models/__init__.py
from .user import User      # re-export: "from myapp.models import User"

# myapp/services/auth.py — relative imports
from ..models import User   # go up two levels, then into models
from ..utils import helper  # sibling package

# ── importlib — dynamic imports ──────────────────────
import importlib, sys

# Import by string name (plugin system pattern)
mod = importlib.import_module("json")
print(mod.dumps({"a": 1}))

# Reload a module (REPL / dev use only)
import myapp.utils
importlib.reload(myapp.utils)

# Check if already imported (avoid re-importing)
if "myapp.utils" in sys.modules:
    utils = sys.modules["myapp.utils"]

# ── __name__ guard ────────────────────────────────────
# myapp/utils.py
def helper(): return 42

if __name__ == "__main__":
    # Only runs when: python myapp/utils.py
    # NOT when:       import myapp.utils
    print(helper())`
},

"os::os module": {
  summary: "§c§os§/c§ provides portable OS interfaces: §c§os.getcwd()§/c§, §c§os.chdir()§/c§, §c§os.listdir()§/c§, §c§os.makedirs(exist_ok=True)§/c§, §c§os.remove()§/c§, §c§os.rename()§/c§, §c§os.environ§/c§ (dict), §c§os.walk()§/c§ (recursive traversal), §c§os.path§/c§ (path manipulation), §c§os.getpid()§/c§, §c§os.cpu_count()§/c§. Prefer §c§pathlib.Path§/c§ for new path manipulation code.",
  when_to_use: "Use §c§os.environ.get('VAR', 'default')§/c§ — never §c§os.environ['VAR']§/c§ (raises §c§KeyError§/c§). Use §c§os.makedirs(path, exist_ok=True)§/c§ to avoid §c§FileExistsError§/c§. Use §c§os.walk()§/c§ for recursive directory traversal. Use §c§shutil.rmtree()§/c§ for recursive deletion (§c§os.rmdir§/c§ only works on empty dirs).",
  gotchas: ["§c§os.remove()§/c§ and §c§os.rmdir()§/c§ cannot remove non-empty directories — use §c§shutil.rmtree()§/c§", "§c§os.makedirs()§/c§ without §c§exist_ok=True§/c§ raises §c§FileExistsError§/c§ if path already exists"],
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

"sys::sys module": {
  summary: "§c§sys§/c§ provides access to interpreter internals. Key: §c§sys.argv§/c§ (CLI args), §c§sys.stdin§/c§ / §c§sys.stdout§/c§ / §c§sys.stderr§/c§, §c§sys.path§/c§ (module search path), §c§sys.version§/c§, §c§sys.platform§/c§, §c§sys.exit()§/c§, §c§sys.getsizeof()§/c§, §c§sys.getrecursionlimit()§/c§ / §c§sys.setrecursionlimit()§/c§, §c§sys.modules§/c§ (imported module cache).",
  when_to_use: "Use §c§sys.argv§/c§ for simple scripts; argparse for anything complex. Use §c§sys.exit(0)§/c§ for clean exits, §c§sys.exit(1)§/c§ for error exits. Modify §c§sys.path§/c§ for custom imports (but prefer proper package structure). Use §c§sys.modules§/c§ to check or mock imports.",
  gotchas: ["§c§sys.argv[0]§/c§ is the script name — user args start at §c§sys.argv[1]§/c§", "§c§sys.exit()§/c§ raises §c§SystemExit§/c§ which CAN be caught — use this in tests to verify exit codes"],
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
  summary: "§c§pathlib.Path§/c§ (Python 3.4+) provides an OO interface for filesystem paths. The §c§/§/c§ operator joins paths cross-platform. Key attributes: §c§.name§/c§, §c§.stem§/c§, §c§.suffix§/c§, §c§.parent§/c§, §c§.parts§/c§. Key methods: §c§.exists()§/c§, §c§.is_file()§/c§, §c§.is_dir()§/c§, §c§.read_text()§/c§/§c§.write_text()§/c§, §c§.glob()§/c§/§c§.rglob()§/c§, §c§.stat()§/c§, §c§.resolve()§/c§. §c§Path.walk()§/c§ (Python 3.12+) is the OO equivalent of §c§os.walk()§/c§, yielding §c§(dirpath, dirnames, filenames)§/c§ tuples. §c§glob()§/c§/§c§rglob()§/c§ gained §c§case_sensitive=§/c§ (3.12) and §c§recurse_symlinks=§/c§ (3.13). §c§relative_to(path, walk_up=True)§/c§ (3.12) allows §c§..§/c§ in the result.",
  when_to_use: "Use §c§Path§/c§ everywhere you used §c§os.path§/c§ string functions. §c§/§/c§ operator for joining is cleaner than §c§os.path.join()§/c§. Use §c§Path.cwd()§/c§ for current dir, §c§Path.home()§/c§ for home. Use §c§Path.resolve()§/c§ for absolute canonical path. Use §c§rglob()§/c§ for recursive file search.",
  gotchas: ["§c§Path.glob()§/c§ returns a generator — wrap in §c§list()§/c§ or iterate once. Holding a generator open while modifying the directory can skip files", "§c§Path.walk()§/c§ is only available from Python 3.12 — use §c§os.walk()§/c§ for older versions"],
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
  summary: "§c§collections.deque§/c§: double-ended queue with O(1) append/pop at both ends (vs O(n) for §c§list.pop(0)§/c§). §c§maxlen§/c§ creates a circular buffer. §c§Counter§/c§: dict subclass for counting, supports arithmetic (+, -, &, |) and §c§most_common(n)§/c§. §c§defaultdict§/c§: auto-creates values via a factory function for missing keys.",
  when_to_use: "Use §c§deque§/c§ for queues and sliding windows — §c§list.pop(0)§/c§ is O(n). Use §c§deque(maxlen=n)§/c§ for rolling buffers. Use §c§Counter§/c§ for frequency counting. Use §c§defaultdict(list)§/c§ for grouping patterns.",
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

"enum::enum essentials": {
  summary: "§c§enum.Enum§/c§ (Python 3.4+) creates symbolic named constants. Members have a §c§.name§/c§ (str) and a §c§.value§/c§. "
    + "§c§auto()§/c§ assigns values automatically: for §c§Enum§/c§/§c§IntEnum§/c§ it increments from 1; for §c§Flag§/c§ it uses powers of two; for §c§StrEnum§/c§ it lowercases the member name. "
    + "§c§IntEnum§/c§ members are also §c§int§/c§ subclasses (comparable to integers). "
    + "§c§StrEnum§/c§ (Python 3.11+) members are also §c§str§/c§ subclasses — useful for string constants like status codes. "
    + "§c§Flag§/c§ members support bitwise operators (§c§&§/c§, §c§|§/c§, §c§^§/c§, §c§~§/c§) and can be combined without losing §c§Flag§/c§ membership. "
    + "§c§@unique§/c§ decorator enforces that no two members share a value.",
  when_to_use: "Use §c§Enum§/c§ instead of bare string or integer constants — members are self-documenting, type-checkable, and iterable. "
    + "Use §c§StrEnum§/c§ for HTTP status labels, config keys, or any constant that must also behave as a plain string (e.g. in JSON serialisation). "
    + "Use §c§Flag§/c§ for bitmask permissions or option sets. "
    + "Prefer §c§Enum§/c§ / §c§Flag§/c§ over §c§IntEnum§/c§ / §c§IntFlag§/c§ for new code — the docs note that §c§IntEnum§/c§ breaks some semantic promises of enumeration by being comparable to unrelated integers.",
  gotchas: ["Enum members are singletons — use §c§Color.RED is Color.RED§/c§ (identity) for comparison, not §c§==§/c§ (though §c§==§/c§ also works)", "Duplicate values create aliases, not new members — §c§Color.CRIMSON = 1§/c§ when §c§RED = 1§/c§ already exists makes §c§CRIMSON§/c§ an alias for §c§RED§/c§. Use §c§@unique§/c§ to prevent this", "§c§IntEnum§/c§ members compare equal to plain integers: §c§Status.OK == 200§/c§ is §c§True§/c§ — this can cause subtle bugs when mixing enum members with raw ints"],
  example: `from enum import Enum, IntEnum, Flag, StrEnum, auto, unique

# Basic Enum — access by name or value
class Color(Enum):
    RED   = 1
    GREEN = 2
    BLUE  = 3

print(Color.RED)           # Color.RED
print(Color.RED.name)      # 'RED'
print(Color.RED.value)     # 1
print(Color(2))            # Color.GREEN  (lookup by value)
print(Color["BLUE"])       # Color.BLUE   (lookup by name)
print(list(Color))         # [Color.RED, Color.GREEN, Color.BLUE]

# auto() — values assigned automatically
@unique
class Direction(Enum):
    NORTH = auto()  # 1
    SOUTH = auto()  # 2
    EAST  = auto()  # 3
    WEST  = auto()  # 4

# StrEnum (Python 3.11+) — members ARE strings
class Status(StrEnum):
    PENDING  = auto()   # "pending"
    ACTIVE   = auto()   # "active"
    ARCHIVED = auto()   # "archived"

print(Status.ACTIVE == "active")  # True
print(f"Status: {Status.ACTIVE}") # "Status: active" (no .value needed)

# Flag — bitwise combination
class Permission(Flag):
    READ    = auto()   # 1
    WRITE   = auto()   # 2
    EXECUTE = auto()   # 4

user = Permission.READ | Permission.WRITE
print(Permission.READ in user)     # True
print(Permission.EXECUTE in user)  # False
admin = Permission.READ | Permission.WRITE | Permission.EXECUTE`
},

"itertools::iterators & combinatorics": {
  summary: "§c§itertools§/c§ provides memory-efficient iterator building blocks. Infinite: §c§count§/c§, §c§cycle§/c§, §c§repeat§/c§. Finite: §c§chain§/c§, §c§chain.from_iterable§/c§, §c§islice§/c§, §c§takewhile§/c§, §c§dropwhile§/c§, §c§filterfalse§/c§, §c§compress§/c§, §c§groupby§/c§, §c§accumulate§/c§, §c§starmap§/c§, §c§batched§/c§ (3.12+). §c§pairwise(iterable)§/c§ (Python 3.10+) yields successive overlapping pairs: §c§pairwise('ABCD')§/c§ → §c§(A,B),(B,C),(C,D)§/c§. §c§starmap(func, iterable)§/c§ applies a function to arguments from an iterable of tuples — like §c§map()§/c§ but unpacks each element. §c§compress(data, selectors)§/c§ filters data by a boolean selector iterable. Combinatorics: §c§product§/c§, §c§permutations§/c§, §c§combinations§/c§.",
  when_to_use: "Use §c§chain.from_iterable()§/c§ to flatten one level of nesting. Use §c§groupby()§/c§ after sorting to group consecutive elements. Use §c§islice()§/c§ to limit infinite generators. Use §c§batched()§/c§ (3.12+) or manual chunking with §c§zip_longest§/c§ for fixed-size batches.",
  gotchas: ["§c§groupby()§/c§ only groups CONSECUTIVE equal keys — sort first if you want all matching items together", "itertools objects are lazy and single-use — call the function again to re-iterate"],
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
  summary: "§c§functools§/c§ provides higher-order function utilities. §c§@lru_cache(maxsize=n)§/c§ memoises with LRU eviction; §c§@cache§/c§ (Python 3.9+) is unbounded memoisation — equivalent to §c§lru_cache(maxsize=None)§/c§. §c§partial(func, *args)§/c§ fixes arguments to create a new callable. §c§reduce(func, iterable)§/c§ applies a two-argument function cumulatively. §c§@singledispatch§/c§ enables type-based function dispatch. §c§@total_ordering§/c§ derives all six comparison methods from §c§__eq__§/c§ plus one of §c§__lt__§/c§, §c§__le__§/c§, §c§__gt__§/c§, or §c§__ge__§/c§. §c§@cached_property§/c§ (Python 3.8+, also in decorators card) computes once and caches on the instance — note it is NOT thread-safe in Python 3.12+ (the lock was removed).",
  when_to_use: "Use §c§@cache§/c§ (Python 3.9+, unbounded) or §c§@lru_cache(maxsize=128)§/c§ for repeated pure function calls. Use §c§@singledispatch§/c§ for type-based dispatch instead of §c§isinstance§/c§ chains. Use §c§partial§/c§ to bind arguments for callbacks or sort keys.",
  gotchas: ["§c§@lru_cache§/c§ requires all arguments to be hashable — raises §c§TypeError§/c§ for list/dict args", "§c§functools.reduce§/c§ requires a non-empty iterable if no initial value is provided — always pass the third initialiser argument"],
  example: `from functools import (lru_cache, cache, partial, reduce,
                        singledispatch, total_ordering, cached_property)

# @cache — unbounded memoisation (Python 3.9+)
@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)
print(fib(50))
print(fib.cache_info())   # CacheInfo(hits=..., misses=..., ...)

# partial — bind arguments
from functools import partial
double = partial(map, lambda x: x*2)
print(list(double([1,2,3])))  # [2, 4, 6]

# @total_ordering — only define __eq__ + one comparison
@total_ordering
class Version:
    def __init__(self, major, minor): self.t = (major, minor)
    def __eq__(self, other): return self.t == other.t
    def __lt__(self, other): return self.t < other.t
    # __le__, __gt__, __ge__ are auto-derived

v1, v2 = Version(2,0), Version(3,1)
print(v1 < v2, v1 <= v2, v1 > v2)  # True True False

# @singledispatch — type-based dispatch
@singledispatch
def process(val):
    raise NotImplementedError(f"No handler for {type(val)}")

@process.register(int)
def _(val): return val * 2

@process.register(str)
def _(val): return val.upper()

print(process(5), process("hi"))  # 10  HI

# reduce
print(reduce(lambda a,b: a*b, [1,2,3,4,5]))  # 120`
},

"datetime::date & time operations": {
  summary: "The §c§datetime§/c§ module provides §c§date§/c§, §c§time§/c§, §c§datetime§/c§, §c§timedelta§/c§, §c§timezone§/c§. §c§datetime.now()§/c§ is naive; §c§datetime.now(tz=timezone.utc)§/c§ is aware. Python 3.11+ adds §c§datetime.UTC§/c§ as a shorthand alias for §c§timezone.utc§/c§. §c§datetime.utcnow()§/c§ and §c§datetime.utcfromtimestamp()§/c§ are <strong>deprecated since Python 3.12</strong> — use §c§datetime.now(datetime.UTC)§/c§ instead. §c§datetime.fromisoformat()§/c§ was enhanced in Python 3.11 to support the full ISO 8601 format; on Python 3.10 and earlier it only accepted strings that §c§isoformat()§/c§ itself would produce. §c§zoneinfo.ZoneInfo§/c§ (Python 3.9+) is the modern timezone library — replaces §c§pytz§/c§.",
  when_to_use: "Always store datetimes in UTC internally, convert to local time only for display. Use §c§timedelta§/c§ for arithmetic. Use §c§datetime.fromisoformat()§/c§ (enhanced in 3.11 to fully support ISO 8601). Use §c§zoneinfo.ZoneInfo§/c§ instead of pytz for new code.",
  gotchas: ["Naive and aware datetimes cannot be compared or subtracted — Python raises §c§TypeError§/c§. Be consistent throughout", "§c§datetime.utcnow()§/c§ is deprecated in Python 3.12 — it returns a naive datetime despite the name. Use §c§datetime.now(datetime.UTC)§/c§", "§c§fromisoformat()§/c§ on Python ≤ 3.10 cannot parse arbitrary ISO 8601 strings (e.g. §c§'2024-11-15T10:30:00Z'§/c§ fails — the §c§Z§/c§ suffix is not supported until 3.11)"],
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
  summary: "Python's §c§re§/c§ module provides PCRE-like regex. Three anchoring levels: §c§re.match()§/c§ anchors to the START only; §c§re.fullmatch()§/c§ anchors both START and END (use for validation); §c§re.search()§/c§ matches anywhere. Group syntax: §c§(...)§/c§ capturing, §c§(?:...)§/c§ non-capturing (no group number assigned), §c§(?P&lt;name&gt;...)§/c§ named. Lookarounds: §c§(?=...)§/c§ positive lookahead, §c§(?!...)§/c§ negative lookahead, §c§(?&lt;=...)§/c§ positive lookbehind, §c§(?&lt;!...)§/c§ negative lookbehind — all are zero-width (they match a position, not characters). Lookbehind patterns must be fixed-width. In §c§re.sub()§/c§ replacement strings, §c§\\g&lt;name&gt;§/c§ references a named group and §c§\\g&lt;0&gt;§/c§ substitutes the entire match. Match objects always evaluate as §c§True§/c§ — enables the walrus pattern. Atomic groups §c§(?&gt;...)§/c§ (Python 3.11+) prevent backtracking.",
  when_to_use: "Compile with §c§re.compile()§/c§ when using a pattern multiple times. Use named groups for readability. Use §c§re.VERBOSE§/c§ for complex patterns with comments. Use §c§re.fullmatch()§/c§ when the entire string must match (not just the start).",
  gotchas: ["§c§re.match()§/c§ only anchors the START — §c§re.match(r'\d+', '123abc')§/c§ succeeds! Use §c§re.fullmatch()§/c§ to require the entire string to match", "Greedy vs lazy: §c§.*§/c§ matches as much as possible; §c§.*?§/c§ as little. On complex patterns greedy can cause catastrophic backtracking — use atomic groups §c§(?>...)§/c§ (3.11+) to prevent it", "§c§re.sub()§/c§ with a function argument — the function receives a match object, not the matched string"],
  example: `import re

# match vs fullmatch vs search
print(bool(re.match(r"\d+", "123abc")))     # True  (anchors start only)
print(bool(re.fullmatch(r"\d+", "123abc"))) # False (anchors both ends)
print(bool(re.search(r"\d+", "abc123")))    # True  (anywhere)

# Non-capturing group (?:...) — group but no group number
pat = re.compile(r"(?:Mr|Ms|Dr)\.\s+(\w+)")  # group 1 = name only
print(pat.search("Dr. Smith").group(1))     # "Smith"

# Lookahead / lookbehind — zero-width, no characters consumed
text = "100px 200em 300px"
# Positive lookahead: digits followed by "px"
print(re.findall(r"\d+(?=px)", text))       # ["100", "300"]
# Negative lookahead: digits NOT followed by "px"
print(re.findall(r"\d+(?!px|\d)", text))   # ["200"]
# Positive lookbehind: word after "Dr. "
print(re.search(r"(?<=Dr\.\s)\w+", "Dr. Watson").group())  # "Watson"
# Negative lookbehind: price NOT preceded by USD
print(re.findall(r"(?<!USD )\d+\.\d+", "10.00 USD 20.00")) # ["10.00"]

# Named groups + named backreference in re.sub()
date = "2024-11-15"
result = re.sub(
    r"(?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})",
    r"\g<d>/\g<m>/\g<y>",   # \g<name> in replacement
    date)
print(result)  # "15/11/2024"

# Walrus pattern — match objects are always truthy
if m := re.search(r"line (\d+)", "Error on line 42"):
    print(m.group(1))  # "42"`
},

"json & csv::json & csv": {
  summary: "§c§json.dumps()§/c§ serialises Python to JSON string; §c§json.loads()§/c§ parses JSON. §c§json.dump()§/c§ / §c§json.load()§/c§ work with files. CSV: use §c§csv.DictReader§/c§ / §c§csv.DictWriter§/c§ for named-column access. Always open CSV files with §c§newline=''§/c§ to prevent double-newline on Windows. All §c§csv.reader§/c§ values are strings — convert explicitly.",
  when_to_use: "Use §c§indent=2§/c§ for human-readable JSON. Use §c§sort_keys=True§/c§ for deterministic output. Handle non-serialisable types (§c§datetime§/c§, §c§Decimal§/c§, §c§set§/c§) with a custom §c§JSONEncoder§/c§. Use §c§csv.DictReader§/c§ over §c§csv.reader§/c§ for readability.",
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

"logging::logging": {
  summary: "Python's logging module provides a hierarchical, configurable system. Levels: §c§DEBUG < INFO < WARNING < ERROR < CRITICAL§/c§. Always use §c§logging.getLogger(__name__)§/c§ in modules. §c§logging.basicConfig(force=True)§/c§ (Python 3.8+) re-configures even if handlers are already attached — without §c§force=True§/c§, §c§basicConfig()§/c§ silently does nothing if any handler exists. §c§QueueHandler§/c§ + §c§QueueListener§/c§ is the recommended production pattern: logging calls push to a queue (fast, non-blocking) while a background thread drains it to the actual handlers — preventing slow handlers (file rotation, SMTP) from blocking web-serving threads. Always use §c§%s§/c§ lazy formatting in log calls — f-strings evaluate eagerly even if the message is never emitted.",
  when_to_use: "Configure the root logger in application entry points using §c§dictConfig§/c§. Library code should only add a §c§NullHandler§/c§. Use §c§logging.config.dictConfig()§/c§ for production configuration. Use lazy formatting: §c§log.debug('value: %s', val)§/c§ not f-strings — the f-string evaluates even if the message won't be logged.",
  gotchas: ["§c§logging.basicConfig()§/c§ has no effect if the root logger already has handlers — pass §c§force=True§/c§ (Python 3.8+) to override, or call it before any other logging code", "Always use §c§%s§/c§ lazy formatting in log calls — f-strings evaluate eagerly even if the message is never emitted"],
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
  summary: "§c§subprocess.run()§/c§ (Python 3.5+) runs a command and blocks until completion. §c§capture_output=True§/c§ captures stdout+stderr. §c§check=True§/c§ raises §c§CalledProcessError§/c§ on non-zero exit. §c§text=True§/c§ decodes to str. Always pass a list — never §c§shell=True§/c§ with user input. §c§subprocess.DEVNULL§/c§ silently discards output (redirects to §c§/dev/null§/c§). §c§stderr=subprocess.STDOUT§/c§ merges stderr into stdout. After a §c§TimeoutExpired§/c§ with §c§Popen§/c§, the child is NOT automatically killed — you must call §c§proc.kill()§/c§ then §c§proc.communicate()§/c§ to clean up properly.",
  when_to_use: "Always pass a list of arguments, not a shell string. Use §c§timeout=§/c§ to prevent hanging. Use §c§Popen§/c§ for streaming large output line-by-line. Use §c§shlex.split()§/c§ to convert a shell string to a safe list when needed.",
  gotchas: ["§c§shell=True§/c§ is a security risk if any part of the command comes from user input — always use lists", "Captured output is bytes by default — pass §c§text=True§/c§ (or §c§encoding='utf-8'§/c§) to get strings", "After §c§TimeoutExpired§/c§ with §c§Popen§/c§, the child is NOT automatically killed — call §c§proc.kill()§/c§ then §c§proc.communicate()§/c§ to clean up"],
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
  summary: "argparse parses command-line arguments with automatic help generation. §c§add_argument()§/c§ defines expected args. §c§parse_args()§/c§ parses §c§sys.argv§/c§. Supports: positional args, optional flags, defaults, type conversion, choices, nargs, mutually exclusive groups, subcommands (§c§add_subparsers()§/c§). Automatically generates §c§--help§/c§.",
  when_to_use: "Use argparse for any script taking CLI arguments. Use §c§add_subparsers()§/c§ for git-style subcommands. Use §c§type=Path§/c§ (from pathlib) to auto-convert path strings. Use §c§action='store_true'§/c§ for boolean flags. Use §c§formatter_class=ArgumentDefaultsHelpFormatter§/c§ to show defaults in help.",
  gotchas: ["§c§parse_args()§/c§ calls §c§sys.exit(2)§/c§ on parse errors — use §c§parse_known_args()§/c§ or pass a list in tests", "Argument names with hyphens (§c§--log-level§/c§) become underscores in the namespace: §c§args.log_level§/c§"],
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

"virtual environments & packaging::venv, pip & pyproject.toml": {
  summary: "§c§venv§/c§ creates isolated Python environments so project dependencies don't conflict with each other or the system Python. "
    + "Activate with §c§source .venv/bin/activate§/c§ (Unix) or §c§.venv\\Scripts\\activate§/c§ (Windows); deactivate with §c§deactivate§/c§. "
    + "§c§pip install§/c§ installs into the active environment. §c§pip freeze§/c§ outputs pinned versions; §c§pip install -r requirements.txt§/c§ reproduces them. "
    + "§c§pip install -e .§/c§ installs the current project in editable mode — changes to source take effect immediately without reinstalling. "
    + "§c§pyproject.toml§/c§ (PEP 518/621) is the modern single-file standard for project metadata, build system config, and tool settings, replacing §c§setup.py§/c§ + §c§setup.cfg§/c§. "
    + "§c§uv§/c§ (Astral, 2024) is a Rust-powered drop-in replacement for §c§pip§/c§ + §c§venv§/c§ that is 10-100x faster — "
    + "it also manages Python versions, creates lock files (§c§uv.lock§/c§), and can scaffold new projects.",
  when_to_use: "Always use a virtual environment — one per project, committed as §c§.venv/§/c§ (add to §c§.gitignore§/c§). "
    + "Use §c§pyproject.toml§/c§ for any project you might share or deploy — it replaces §c§setup.py§/c§, §c§setup.cfg§/c§, and §c§MANIFEST.in§/c§. "
    + "Use §c§uv§/c§ for new projects or anywhere install speed matters (CI pipelines, Docker builds). "
    + "Use §c§pip install -e .§/c§ during development of a library so imports always reflect the latest source.",
  gotchas: ["Never §c§pip install§/c§ without an active virtual environment — you will pollute the system Python and cause hard-to-debug conflicts", "Committing §c§requirements.txt§/c§ without pinning exact versions (§c§pip freeze§/c§) causes non-reproducible installs — use a lock file or pin everything", "§c§uv.lock§/c§ should be committed to version control; §c§.venv/§/c§ should not"],
  example: `# ── venv (built-in) ──────────────────────────────────
python -m venv .venv             # create virtual environment
source .venv/bin/activate        # Unix/macOS
# .venv\Scripts\activate         # Windows

pip install requests pandas      # install into active env
pip install -e .                 # editable install (dev mode)
pip freeze > requirements.txt    # pin all installed versions
pip install -r requirements.txt  # reproduce environment
deactivate                       # exit virtual environment

# ── pyproject.toml (PEP 518 / 621) ──────────────────
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.28", "pandas>=2.0"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[tool.ruff]        # tool-specific config lives here
line-length = 88

# ── uv (fast modern alternative) ────────────────────
# Install: curl -LsSf https://astral.sh/uv/install.sh | sh
uv init my-project           # scaffold + pyproject.toml
uv add requests pandas       # add deps (updates uv.lock)
uv add --dev pytest ruff     # dev-only deps
uv run python main.py        # run in managed env
uv sync                      # install exact lock file versions
uv pip install -r req.txt    # drop-in pip replacement`
},

"unittest::unittest & doctest": {
  summary: "§c§unittest§/c§ is Python's built-in xUnit-style test framework. Tests are methods in §c§TestCase§/c§ subclasses starting with §c§test_§/c§. §c§setUp()§/c§ / §c§tearDown()§/c§ run before/after each test. §c§setUpClass()§/c§ / §c§tearDownClass()§/c§ are class-level. Key assertions: §c§assertEqual§/c§, §c§assertTrue§/c§, §c§assertRaises§/c§, §c§assertAlmostEqual§/c§, §c§assertIn§/c§, §c§assertIsNone§/c§. §c§unittest.mock§/c§ provides §c§Mock§/c§, §c§MagicMock§/c§, §c§patch§/c§, §c§patch.object§/c§.",
  when_to_use: "Use §c§unittest§/c§ for xUnit-style testing (enterprise/legacy codebases). For new projects prefer pytest. §c§unittest.mock§/c§ is excellent regardless of test runner. Use §c§patch()§/c§ as a context manager or decorator for clean, scoped mocking.",
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

};
