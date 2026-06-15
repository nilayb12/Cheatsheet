// Python Cheatsheet — cards-advanced.js
// Auto-split from cards.js by page

window.CARD_DATA_ADVANCED = {

"classes & inheritance::classes, inheritance & properties": {
  summary: "Python classes support single and multiple inheritance, cooperative §c§super()§/c§, class/static methods, properties, slots, and ABCs. The Method Resolution Order (MRO) uses C3 linearisation. §c§@property§/c§ creates managed attributes without changing the calling interface. §c§__slots__§/c§ replaces the instance §c§__dict__§/c§ to reduce memory usage on classes with many instances. §c§__init_subclass__(cls, **kwargs)§/c§ is called on the base class whenever it is subclassed — a lightweight hook for registering or validating subclasses without needing a metaclass. Metaclasses (classes whose instances are classes) are the deepest customisation layer — use them only when §c§__init_subclass__§/c§, class decorators, or §c§__class_getitem__§/c§ are insufficient.",
  when_to_use: "Use §c§@property§/c§ to add computed attributes or validation without changing the public API. Use §c§@classmethod§/c§ for alternative constructors. Use §c§@staticmethod§/c§ for utility functions logically belonging to the class. Use §c§__slots__§/c§ when creating millions of instances.",
  gotchas: ["In multiple inheritance, every class should call §c§super().__init__()§/c§ for cooperative MRO to work correctly", "Defining §c§__slots__§/c§ prevents arbitrary attributes — instances can only have the declared attributes"],
  example: `class Animal:
    def __init__(self, name: str): self.name = name
    def speak(self) -> str: raise NotImplementedError

    # __init_subclass__ — runs when Animal is subclassed
    def __init_subclass__(cls, sound: str = "", **kw):
        super().__init_subclass__(**kw)
        cls._sound = sound  # auto-set on each subclass

class Dog(Animal, sound="Woof"):
    def speak(self): return f"{self.name}: {self._sound}"

class Cat(Animal, sound="Meow"):
    def speak(self): return f"{self.name}: {self._sound}"

print(Dog("Rex").speak())  # "Rex: Woof"

# @property — computed attribute
class Circle:
    def __init__(self, r): self._r = r
    @property
    def radius(self): return self._r
    @radius.setter
    def radius(self, v):
        if v < 0: raise ValueError("negative radius")
        self._r = v
    @property
    def area(self): return 3.14159 * self._r ** 2

# @classmethod alternative constructor
class Date:
    def __init__(self, y, m, d): self.y,self.m,self.d = y,m,d
    @classmethod
    def from_iso(cls, s: str):
        return cls(*map(int, s.split("-")))

print(Date.from_iso("2024-11-15").y)  # 2024

# Multiple inheritance — cooperative super()
class A:
    def method(self): return "A"
class B(A):
    def method(self): return "B→" + super().method()
class C(A):
    def method(self): return "C→" + super().method()
class D(B, C): pass  # MRO: D→B→C→A
print(D().method())  # "B→C→A"`
},

"protocols & abstract classes::protocols & abstract classes": {
  summary: "Abstract base classes (§c§abc.ABC§/c§ + §c§@abstractmethod§/c§) enforce interface contracts at instantiation time. Protocols (§c§typing.Protocol§/c§, Python 3.8+) enable structural subtyping — a class satisfies a Protocol by having the right methods without inheriting from it. §c§@runtime_checkable§/c§ allows §c§isinstance()§/c§ checks at runtime.",
  when_to_use: "Use ABC for explicit inheritance hierarchies where you own all implementing classes. Use Protocol for duck-typed interfaces and third-party code. Protocols are preferred in modern Python for type safety without tight coupling.",
  gotchas: ["§c§isinstance(obj, MyProtocol)§/c§ only works if the Protocol is decorated §c§@runtime_checkable§/c§", "ABCs raise §c§TypeError§/c§ at instantiation (not class definition) if abstract methods are not overridden"],
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
  summary: "Special methods define how objects behave with Python built-in operations. §c§__repr__§/c§ for unambiguous repr (ideally eval-able). §c§__str__§/c§ for user-friendly string. §c§__len__§/c§, §c§__getitem__§/c§ / §c§__setitem__§/c§ / §c§__delitem__§/c§ for sequences/mappings. §c§__iter__§/c§ / §c§__next__§/c§ for iteration. §c§__call__§/c§ for callable objects. §c§__eq__§/c§ / §c§__hash__§/c§ for equality and hashing. §c§functools.total_ordering§/c§ derives comparison methods from §c§__eq__§/c§ + one comparison.",
  when_to_use: "Implement §c§__repr__§/c§ for all non-trivial classes. If you define §c§__eq__§/c§, also define §c§__hash__§/c§ (or set to §c§None§/c§ to make unhashable). Use §c§total_ordering§/c§ to avoid implementing all 6 comparison methods manually.",
  gotchas: ["Defining §c§__eq__§/c§ implicitly sets §c§__hash__ = None§/c§ — explicitly define §c§__hash__§/c§ if instances need to be in sets or as dict keys", "If only §c§__repr__§/c§ is defined, Python uses it for §c§str(obj)§/c§ too"],
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
  summary: "A decorator is a callable that wraps a function. Always use §c§@functools.wraps(func)§/c§ inside to preserve §c§__name__§/c§, §c§__doc__§/c§. Parametrised decorators require three levels: factory→decorator→wrapper. Decorators are applied bottom-up at definition time — they run when the module is imported.",
  when_to_use: "Use decorators for cross-cutting concerns: logging, timing, retrying, caching, auth checks. Use §c§@functools.lru_cache§/c§ / §c§@functools.cache§/c§ (Python 3.9+) for memoisation. Compose decorators by stacking.",
  gotchas: ["Forgetting §c§@wraps(func)§/c§ breaks introspection — §c§decorated_func.__name__§/c§ returns the wrapper name", "Stacked decorators apply bottom-up: the decorator closest to the function runs first"],
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
  summary: "The iterator protocol: §c§__iter__§/c§ returns self, §c§__next__§/c§ returns next value or raises §c§StopIteration§/c§. An iterable implements only §c§__iter__§/c§ (returns a fresh iterator each call). Generator functions simplify this with §c§yield§/c§. Generators support §c§send(value)§/c§ for coroutine-style communication. §c§yield from§/c§ delegates to sub-generators and propagates §c§send()§/c§ / §c§throw()§/c§.",
  when_to_use: "Use generator functions instead of iterator classes. Use §c§yield from§/c§ to delegate and propagate signals. Use §c§itertools.islice(gen, n)§/c§ to take limited items from infinite generators.",
  gotchas: ["§c§StopIteration§/c§ raised inside a generator becomes §c§RuntimeError§/c§ in Python 3.7+ (PEP 479) — use §c§return§/c§ to end a generator", "Generators are single-use — once exhausted they yield nothing. Call the function again for a fresh generator"],
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
  summary: "§c§asyncio§/c§ implements cooperative multitasking via an event loop. §c§async def§/c§ defines coroutines. §c§await§/c§ suspends until the awaitable completes. §c§asyncio.TaskGroup§/c§ (Python 3.11+) is the modern structured-concurrency primitive: it cancels all tasks if any fails and raises an §c§ExceptionGroup§/c§. §c§asyncio.gather()§/c§ still works but is soft-deprecated in 3.13 in favour of §c§TaskGroup§/c§. §c§asyncio.timeout()§/c§ added in Python 3.11. Critical: §c§TaskGroup§/c§ and §c§timeout()§/c§ use cancellation internally — never swallow §c§CancelledError§/c§ inside a task group.",
  when_to_use: "Use asyncio for I/O-bound concurrency. Use §c§asyncio.gather()§/c§ for concurrent independent tasks. Use §c§asyncio.Semaphore§/c§ to throttle concurrent operations. Use §c§TaskGroup§/c§ (Python 3.11+) for structured concurrency with automatic cancellation on error.",
  gotchas: ["Calling blocking functions (§c§time.sleep§/c§, §c§requests.get§/c§) inside async code blocks the entire event loop — use §c§await asyncio.sleep()§/c§ and aiohttp", "Never swallow §c§asyncio.CancelledError§/c§ inside a TaskGroup — structured cancellation depends on it propagating correctly", "§c§asyncio.gather()§/c§ is soft-deprecated in 3.13 — use §c§TaskGroup§/c§ for new structured-concurrency code"],
  example: `import asyncio

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name}: done"

# TaskGroup (Python 3.11+) — preferred structured concurrency
async def with_taskgroup():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch("A", 1.0))
        t2 = tg.create_task(fetch("B", 0.5))
    return [t1.result(), t2.result()]

# asyncio.timeout() (Python 3.11+)
async def with_timeout():
    try:
        async with asyncio.timeout(5.0):
            return await fetch("slow", 10)
    except TimeoutError:
        return None

# Queue — async producer/consumer
async def producer_consumer():
    q = asyncio.Queue(maxsize=10)
    async def produce():
        for i in range(5):
            await q.put(i);  await asyncio.sleep(0)
        await q.put(None)   # sentinel
    async def consume():
        while (item := await q.get()) is not None:
            print(f"got {item}"); q.task_done()
    async with asyncio.TaskGroup() as tg:
        tg.create_task(produce())
        tg.create_task(consume())

# Event — signal between tasks
async def use_event():
    ready = asyncio.Event()
    async def setter():
        await asyncio.sleep(1); ready.set()
    async def waiter():
        await ready.wait()  # blocks until set()
        print("ready!")
    async with asyncio.TaskGroup() as tg:
        tg.create_task(setter())
        tg.create_task(waiter())

# Lock — mutual exclusion
async def use_lock():
    lock = asyncio.Lock()
    shared = []
    async def worker(val):
        async with lock:
            shared.append(val)  # safe
    async with asyncio.TaskGroup() as tg:
        for i in range(5): tg.create_task(worker(i))
    return shared

asyncio.run(with_taskgroup())`
},

"type hints::typing module": {
  summary: "Type hints (PEP 484) annotate code for static analysis by mypy/pyright. Python 3.9+: built-in generics §c§list[int]§/c§. Python 3.10+: §c§X | Y§/c§ union syntax. Python 3.12 (PEP 695): new §c§type§/c§ alias statement and §c§class Foo[T]:§/c§ generic class syntax. Python 3.13 (PEP 696): §c§TypeVar§/c§ now supports §c§default=§/c§. Python 3.13 (PEP 702): §c§@warnings.deprecated()§/c§ marks deprecations in the type system and at runtime. Python 3.13 (PEP 705): §c§typing.ReadOnly§/c§ marks §c§TypedDict§/c§ items read-only. Python 3.13 (PEP 742): §c§TypeIs§/c§ is a more intuitive alternative to §c§TypeGuard§/c§ for type narrowing. Not enforced at runtime — use Pydantic or beartype for that.",
  when_to_use: "Add §c§from __future__ import annotations§/c§ for forward references. Use §c§TypeVar§/c§ for generic functions. Use §c§ParamSpec§/c§ for type-safe decorator signatures. Use §c§TYPE_CHECKING§/c§ block to avoid circular imports at runtime.",
  gotchas: ["Type hints are NOT enforced at runtime — use pydantic or §c§beartype§/c§ for runtime validation", "Circular imports: use §c§from __future__ import annotations§/c§ or §c§if TYPE_CHECKING: from x import Y§/c§"],
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

"type hints::typing extras": {
  summary: "§c§Annotated[T, metadata]§/c§ (Python 3.9+, PEP 593) attaches arbitrary metadata to a type — used by Pydantic, FastAPI, and other frameworks for validation constraints. "
    + "The type checker sees §c§T§/c§; the metadata is available at runtime via §c§typing.get_type_hints(include_extras=True)§/c§. "
    + "§c§TypeAlias§/c§ (Python 3.10+, PEP 613) explicitly marks a variable as a type alias, preventing type checkers from treating it as an assignment. "
    + "Python 3.12 introduced the §c§type§/c§ statement (PEP 695) as a cleaner syntax: §c§type Vector = list[float]§/c§. "
    + "§c§TypeVarTuple§/c§ (Python 3.11+, PEP 646) enables variadic generics — functions or classes that are generic over an arbitrary number of types (e.g. typed §c§*args§/c§). "
    + "§c§ParamSpec§/c§ (Python 3.10+, PEP 612) captures the full parameter specification of a callable for type-safe decorators. "
    + "§c§TypeIs[T]§/c§ (Python 3.13+, PEP 742) is a narrowing-only form of type guard — stricter than §c§TypeGuard§/c§.",
  when_to_use: "Use §c§Annotated§/c§ to attach validation constraints, units, or documentation metadata to a type without losing the base type information. "
    + "Use the §c§type§/c§ statement (3.12+) or §c§TypeAlias§/c§ (3.10+) to mark complex type aliases explicitly — bare assignments like §c§Vector = list[float]§/c§ are ambiguous to type checkers. "
    + "Use §c§ParamSpec§/c§ when writing decorators that must preserve the wrapped function's full signature. "
    + "Use §c§TypeVarTuple§/c§ for tuple-like generics where the number of type parameters varies.",
  gotchas: ["§c§Annotated§/c§ metadata is stripped by §c§get_type_hints()§/c§ by default — pass §c§include_extras=True§/c§ to retain it", "§c§TypeAlias§/c§ is deprecated in Python 3.12+ in favour of the §c§type§/c§ statement — use §c§type Alias = ...§/c§ in new 3.12+ code", "Type hints are NOT enforced at runtime regardless of these constructs — use Pydantic or §c§beartype§/c§ for runtime validation"],
  example: `from typing import Annotated, TypeAlias, TypeVarTuple, Unpack, ParamSpec, TypeVar
from collections.abc import Callable

# Annotated — type + metadata (used by Pydantic, FastAPI, etc.)
Positive = Annotated[int, "must be > 0"]
Name     = Annotated[str, "max 100 chars"]

def create_user(age: Positive, name: Name) -> None: ...

# Access metadata at runtime
import typing
hints = typing.get_type_hints(create_user, include_extras=True)
print(hints["age"])       # Annotated[int, 'must be > 0']
print(hints["age"].__metadata__)  # ('must be > 0',)

# TypeAlias (3.10+) — explicit alias declaration
Vector: TypeAlias = list[float]

# type statement (3.12+) — cleaner syntax, lazy evaluation
# type Vector = list[float]
# type Matrix[T] = list[list[T]]  # generic alias

# ParamSpec — preserve decorator signature (3.10+)
P = ParamSpec("P")
T = TypeVar("T")

def logged(fn: Callable[P, T]) -> Callable[P, T]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@logged
def add(x: int, y: int) -> int:  # signature fully preserved
    return x + y

# TypeVarTuple — variadic generics (3.11+)
Ts = TypeVarTuple("Ts")

def zip_map(fn: Callable[[*Ts], T], *args: *Ts) -> T:
    return fn(*args)

# TypeIs (3.13+) — narrowing type guard
from typing import TypeIs

def is_str_list(val: list[object]) -> TypeIs[list[str]]:
    return all(isinstance(x, str) for x in val)`
},

"dataclasses::dataclass essentials": {
  summary: "§c§@dataclass§/c§ (Python 3.7+) auto-generates §c§__init__§/c§, §c§__repr__§/c§, §c§__eq__§/c§. Options: §c§frozen=True§/c§ (immutable + hashable), §c§order=True§/c§ (comparison methods), §c§slots=True§/c§ (Python 3.10+), §c§kw_only=True§/c§ (Python 3.10+). §c§KW_ONLY§/c§ sentinel (Python 3.10+) makes all subsequent fields keyword-only. §c§field()§/c§ customises per-field behaviour. §c§__post_init__§/c§ runs after §c§__init__§/c§ for validation. Python 3.13+: §c§copy.replace(obj, **changes)§/c§ is the new generic replacement function that works on dataclasses, namedtuples, and any class defining §c§__replace__()§/c§.",
  when_to_use: "Use §c§@dataclass§/c§ for DTOs, value objects, and structured data. Use §c§frozen=True§/c§ for immutable records. Use §c§field(default_factory=list)§/c§ for mutable defaults. Use §c§InitVar§/c§ for init-only parameters not stored as fields.",
  gotchas: ["§c§items: list = []§/c§ raises §c§ValueError§/c§ — mutable defaults must use §c§field(default_factory=list)§/c§", "With §c§frozen=True§/c§ and inheritance, the parent must also be frozen or have no fields"],
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
  summary: "Python memory model: reference counting + cyclic GC. Reference counting handles most objects immediately; the cyclic garbage collector (§c§gc§/c§ module) handles reference cycles — objects that reference each other and would never reach zero refcount. §c§gc.collect()§/c§ forces a cycle collection; §c§gc.get_count()§/c§ shows pending objects. §c§weakref.ref(obj)§/c§ creates a weak reference that does not prevent garbage collection — used for caches and observer patterns to avoid cycles. §c§weakref.WeakValueDictionary§/c§ auto-removes entries when values are collected. The GIL serialises Python bytecode in the standard build — Python 3.13 added an opt-in free-threaded build (§c§python3.13t§/c§, PEP 703); Python 3.14 promoted it to supported (PEP 779). Python 3.12 added §c§sys.monitoring§/c§ (PEP 669) as a low-overhead profiling hook. Profiling tools: §c§cProfile§/c§, §c§tracemalloc§/c§, §c§timeit§/c§. Optimisations: §c§__slots__§/c§, generators, local variable caching.",
  when_to_use: "Profile before optimising. Use §c§timeit.timeit()§/c§ for benchmarking. Use §c§tracemalloc§/c§ for memory leaks. Remember: local variable access is faster than global or attribute access — cache frequently used globals/methods in local variables inside hot loops.",
  gotchas: ["§c§sys.getsizeof(lst)§/c§ only measures the list container overhead, not the contained objects", "Free-threaded builds (Python 3.13t+) may have different performance characteristics — profile on your target build"],
  example: `import sys, gc, weakref, cProfile, pstats, io, timeit

# Reference cycle — without gc, would leak
class Node:
    def __init__(self, val): self.val = val; self.next = None

a = Node(1); b = Node(2)
a.next = b; b.next = a   # cycle!
del a, b
print(gc.get_count())    # (n, n, n) — pending collection
print(gc.collect())      # returns number of objects collected

# weakref — reference without preventing garbage collection
class Cache:
    pass

obj = Cache()
ref = weakref.ref(obj)   # weak reference
print(ref())             # <Cache object> — still alive
del obj
print(ref())             # None — object was collected

# WeakValueDictionary — cache that auto-cleans
cache = weakref.WeakValueDictionary()
result = Cache()
cache["key"] = result
del result
print("key" in cache)   # False — auto-removed

# __slots__ — reduce per-instance memory
class WithSlots:
    __slots__ = ("x","y")
    def __init__(self,x,y): self.x=x; self.y=y
print(sys.getsizeof(WithSlots(1,2)))  # ~56 bytes (no __dict__)

# cProfile + sys.monitoring (3.12+)
profiler = cProfile.Profile()
profiler.enable()
sum(x**2 for x in range(100_000))
profiler.disable()
s = io.StringIO()
pstats.Stats(profiler,stream=s).sort_stats("cumulative").print_stats(3)

# timeit microbenchmark
print(timeit.timeit("sum(range(1000))", number=10_000))`
},

"memory & performance::weakref & reference cycles": {
  summary: "Python's reference counting frees most objects immediately when their refcount reaches zero. "
    + "However, <strong>reference cycles</strong> (A → B → A) keep refcounts above zero permanently — "
    + "the cyclic garbage collector (§c§gc§/c§ module) handles these by periodically scanning for cycles. "
    + "§c§weakref.ref(obj)§/c§ creates a weak reference that does NOT prevent garbage collection — "
    + "calling it returns the object if still alive, or §c§None§/c§ if already collected. "
    + "§c§weakref.WeakValueDictionary§/c§ maps keys to weakly-referenced values; entries are automatically removed when values are collected. "
    + "§c§weakref.WeakKeyDictionary§/c§ does the same for keys. "
    + "§c§weakref.finalize(obj, fn)§/c§ registers a cleanup callback called when §c§obj§/c§ is garbage collected.",
  when_to_use: "Use §c§weakref§/c§ for caches, observer/event systems, and any mapping where the presence in the cache should not prevent the cached object from being freed. "
    + "Use §c§gc.collect()§/c§ to force a collection cycle in long-running processes with known cyclic data structures. "
    + "Use §c§gc.get_count()§/c§ to inspect how many objects are pending collection in each generation.",
  gotchas: ["Not all objects support weak references — built-in types like §c§int§/c§, §c§str§/c§, §c§list§/c§, §c§dict§/c§, §c§tuple§/c§ do NOT. User-defined classes do by default, unless §c§__slots__§/c§ is used without §c§__weakref__§/c§", "A weak reference can become §c§None§/c§ between when you check it and when you use it in a multi-threaded program — store the result of §c§ref()§/c§ in a local variable and check that"],
  example: `import gc, weakref

# ── Reference cycles ──────────────────────────────────
class Node:
    def __init__(self, val): self.val = val; self.next = None

a, b = Node(1), Node(2)
a.next = b; b.next = a    # cycle — refcount never reaches 0
del a, b
print(gc.get_count())     # (n, n, n) — objects pending collection
collected = gc.collect()  # force cycle collection
print(f"collected {collected} objects")

# ── weakref.ref ───────────────────────────────────────
class Resource:
    def __repr__(self): return "Resource()"

obj = Resource()
ref = weakref.ref(obj)   # weak reference
print(ref())             # Resource()  — still alive
del obj
print(ref())             # None        — collected

# ── WeakValueDictionary — auto-evicting cache ─────────
cache = weakref.WeakValueDictionary()

def get_resource(key):
    if (r := cache.get(key)) is None:
        r = Resource()
        cache[key] = r   # stored weakly
    return r

r = get_resource("a")
print(len(cache))        # 1
del r                    # no other strong references
print(len(cache))        # 0 — auto-removed

# ── finalize — cleanup callback ───────────────────────
def on_collected():
    print("Resource freed!")

obj2 = Resource()
weakref.finalize(obj2, on_collected)
del obj2                 # prints "Resource freed!"`
},

"concurrency::threading, multiprocessing & futures": {
  summary: "§c§threading§/c§ is suitable for I/O-bound work. The GIL limits true CPU-parallel execution in the standard CPython build — but Python 3.13 (PEP 703) introduced an optional free-threaded build (§c§python3.13t§/c§) and Python 3.14 (PEP 779) promoted it to officially supported. The standard GIL build still achieves true parallelism during I/O waits and C extension calls. §c§multiprocessing§/c§ spawns separate processes — bypasses the GIL on all builds. §c§ThreadPoolExecutor§/c§ / §c§ProcessPoolExecutor§/c§ provide a high-level futures API. §c§queue.Queue§/c§ is the safest way to pass data between threads.",
  when_to_use: "Use ThreadPoolExecutor for I/O-bound concurrent tasks. Use ProcessPoolExecutor for CPU-bound parallel work. Use asyncio for very high concurrency I/O. Use queue.Queue for safe inter-thread data passing.",
  gotchas: ["multiprocessing on Windows uses spawn — worker functions must be importable (no lambdas) and §c§if __name__ == '__main__':§/c§ is required", "Free-threaded Python 3.13t / 3.14t is opt-in (separate executable). Many C extensions are not yet thread-safe without the GIL — check py-free-threading.github.io for library status", "Data between processes is pickle-serialised — unpicklable objects (lambdas, file handles) cannot be passed directly"],
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

// PAGE 3 — STANDARD LIBRARY,

"decorators::built-in decorators": {
  summary: "§c§@property§/c§ creates managed attributes. §c§@classmethod§/c§ receives the class as first arg. §c§@staticmethod§/c§ has no implicit first arg. §c§@functools.cached_property§/c§ (3.8+) computes once and caches per instance. §c§@functools.lru_cache(maxsize=n)§/c§ memoises with LRU eviction. §c§@functools.cache§/c§ (3.9+) is unbounded memoisation.",
  when_to_use: "Use §c§@cached_property§/c§ for expensive one-time computed properties. Use §c§@lru_cache§/c§ / §c§@cache§/c§ for pure functions called repeatedly with the same args. Use §c§@classmethod§/c§ for alternative constructors like §c§from_json§/c§ or §c§from_file§/c§.",
  gotchas: ["§c§@cached_property§/c§ is NOT thread-safe in Python 3.12+ (the lock was removed) — use §c§@lru_cache§/c§ on a method for thread-safe caching", "§c§@lru_cache§/c§ requires all arguments to be hashable — lists or dicts raise §c§TypeError§/c§"],
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
}

};
