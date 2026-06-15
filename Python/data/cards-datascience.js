// Python Cheatsheet — cards-datascience.js
// Auto-split from cards.js by page

window.CARD_DATA_DATASCIENCE = {

"numpy — arrays::array creation & indexing": {
  summary: "NumPy ndarrays are fixed-type, fixed-size, n-dimensional arrays stored in contiguous memory. Creation: §c§np.array()§/c§, §c§np.zeros()§/c§, §c§np.ones()§/c§, §c§np.arange()§/c§, §c§np.linspace()§/c§, §c§np.random.default_rng()§/c§. Key attributes: §c§shape§/c§, §c§dtype§/c§, §c§ndim§/c§, §c§size§/c§, §c§itemsize§/c§. Indexing: integer, slice (returns VIEW), boolean (returns COPY), fancy/integer-array indexing (returns COPY).",
  when_to_use: "Use NumPy for any numeric array processing — 10-100x faster than Python lists due to SIMD and cache locality. Use §c§dtype=np.float32§/c§ for ML workloads to halve memory vs §c§float64§/c§. Use §c§np.random.default_rng(seed)§/c§ for reproducible random numbers (replaces legacy §c§np.random§/c§).",
  gotchas: ["Slices return VIEWS — modifying a slice modifies the original array. Use §c§.copy()§/c§ for independence", "Integer-array indexing returns a COPY, not a view — assigning to a fancy-indexed result does not update the original"],
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
  summary: "NumPy operations are vectorised — element-wise, no Python loops needed. Broadcasting extends operations to arrays of different shapes: dimensions compared trailing-first; each must be equal or one of them must be 1 (stretched). Universal functions (ufuncs) like §c§np.sqrt§/c§, §c§np.exp§/c§ are highly optimised C/Fortran. §c§@§/c§ operator for matrix multiply.",
  when_to_use: "Replace all Python loops over arrays with NumPy vectorised operations. Use §c§np.where(cond, x, y)§/c§ as vectorised if-else. Use §c§np.einsum()§/c§ for complex tensor operations. Use §c§np.apply_along_axis()§/c§ only as a last resort — it is essentially a Python loop.",
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
  summary: "§c§Series§/c§ is a 1D labelled array; §c§DataFrame§/c§ is a 2D labelled table. Creation: §c§pd.read_csv()§/c§, §c§pd.read_parquet()§/c§, §c§pd.read_excel()§/c§, §c§pd.DataFrame(dict)§/c§. Inspection: §c§head()§/c§, §c§tail()§/c§, §c§info()§/c§, §c§describe()§/c§, §c§dtypes§/c§, §c§shape§/c§, §c§value_counts()§/c§. §c§df['col']§/c§ returns a Series; §c§df[['col']]§/c§ returns a single-column DataFrame.",
  when_to_use: "Use §c§df.info(memory_usage='deep')§/c§ to check actual memory usage. Specify §c§dtype=§/c§ when reading CSVs to avoid inference overhead. Use §c§pd.read_parquet()§/c§ for large datasets — much faster than CSV. Use §c§df.select_dtypes(include='number')§/c§ to select numeric columns.",
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
  summary: "Core transformations: §c§assign()§/c§ for chaining-friendly column creation, §c§apply()§/c§ for row/column functions, §c§map()§/c§ (element-wise on Series), §c§query()§/c§ for SQL-like filtering, §c§sort_values()§/c§, §c§drop_duplicates()§/c§, §c§fillna()§/c§ / §c§dropna()§/c§. Method chaining with §c§pipe()§/c§ for custom steps. §c§.str§/c§ accessor for vectorised string ops. §c§.dt§/c§ accessor for datetime ops.",
  when_to_use: "Use §c§assign()§/c§ for method chaining instead of §c§df['col'] = ...§/c§. Use §c§query()§/c§ for readable string-expression filters. Use §c§pipe(fn)§/c§ to insert custom functions into chains. Prefer vectorised ops over §c§apply()§/c§ — §c§apply()§/c§ is essentially a Python loop.",
  gotchas: ["§c§SettingWithCopyWarning§/c§: assign to §c§df.loc[]§/c§ not to a slice. Use §c§assign()§/c§ to create modified copies", "Pandas uses §c§NaN§/c§ (float) for missing numeric data — this can coerce integer columns to float. Use nullable integer dtype §c§Int64§/c§ (capital I) for nullable integers"],
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
  summary: "§c§groupby()§/c§ splits rows into groups, applies a function, combines results (split-apply-combine). §c§agg()§/c§ applies multiple aggregations. §c§transform()§/c§ returns a same-index result (no rows dropped) — useful for adding group stats back to original. §c§pd.merge()§/c§ is SQL-style join. §c§pd.concat()§/c§ stacks DataFrames. Use §c§validate=§/c§ to catch unexpected relationship cardinality.",
  when_to_use: "Use §c§transform()§/c§ instead of §c§agg()§/c§ + merge when adding aggregated values as new columns. Use §c§groupby().filter()§/c§ to drop entire groups. Use §c§validate='m:1'§/c§ or §c§'1:1'§/c§ in §c§merge()§/c§ to catch accidental cartesian products. Use §c§pd.concat(axis=0)§/c§ for UNION ALL, §c§axis=1§/c§ for side-by-side.",
  gotchas: ["§c§groupby()§/c§ excludes NaN keys by default — use §c§dropna=False§/c§ to include them", "§c§merge()§/c§ on non-unique keys creates cartesian product — always check §c§len(result)§/c§ after a merge"],
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
  summary: "Matplotlib is Python's foundational plotting library. Two APIs: pyplot state-machine (§c§plt.plot()§/c§) and OO (§c§fig, ax = plt.subplots()§/c§). The OO API is preferred for production code. §c§Figure§/c§ is the top-level container; §c§Axes§/c§ is an individual plot. Key chart types: §c§plot§/c§, §c§scatter§/c§, §c§bar§/c§ / §c§barh§/c§, §c§hist§/c§, §c§boxplot§/c§, §c§imshow§/c§. §c§twinx()§/c§ creates a dual y-axis.",
  when_to_use: "Always use the OO API for multi-panel figures. Use §c§plt.style.use('seaborn-v0_8')§/c§ for publication defaults. Use §c§df.plot(ax=ax)§/c§ for quick Pandas plots. Set §c§dpi=150§/c§ and §c§bbox_inches='tight'§/c§ when saving figures.",
  gotchas: ["§c§plt.show()§/c§ clears the current figure — don't call it between subplots. Call once at the end or use §c§savefig()§/c§", "Axes methods (§c§ax.set_xlabel()§/c§, §c§ax.legend()§/c§) are preferred over §c§plt.xlabel()§/c§ pyplot shortcuts in multi-panel figures"],
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
  summary: "§c§requests§/c§ is the standard Python HTTP client. §c§requests.get§/c§ / §c§post§/c§ / §c§put§/c§ / §c§delete§/c§ / §c§patch()§/c§ are convenience methods. Response: §c§r.status_code§/c§, §c§r.json()§/c§, §c§r.text§/c§, §c§r.content§/c§ (bytes), §c§r.headers§/c§. §c§r.raise_for_status()§/c§ raises §c§HTTPError§/c§ for 4xx/5xx. Sessions reuse TCP connections and persist headers/cookies. Always set §c§timeout=§/c§ to prevent indefinite blocking.",
  when_to_use: "Use §c§requests.Session()§/c§ when making multiple requests to the same host — TCP connection reuse. Always pass §c§timeout=(connect, read)§/c§ as a tuple. Use §c§HTTPAdapter§/c§ with §c§Retry§/c§ for automatic retry. Use §c§stream=True§/c§ and §c§iter_content()§/c§ for large downloads.",
  gotchas: ["§c§requests§/c§ has NO default timeout — a slow server can hang forever. Always pass §c§timeout=(5, 30)§/c§", "§c§stream=True§/c§ keeps the connection open — use it as a context manager to ensure it closes"],
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
  summary: "Pydantic v2 (2023, Rust-powered, 5-50x faster than v1) validates data using Python type annotations. §c§BaseModel§/c§ subclasses define schemas. §c§model_validate()§/c§ validates from dict/object. §c§model_dump()§/c§ serialises. §c§model_dump(mode='json')§/c§ gives JSON-serialisable output. §c§field_validator§/c§, §c§model_validator§/c§, §c§computed_field§/c§ for custom logic. §c§ConfigDict§/c§ controls behaviour.",
  when_to_use: "Use Pydantic for API request/response models, config parsing, and any external data. Use §c§model_validate(dict)§/c§ not direct construction for external data. Use §c§ConfigDict(strict=True)§/c§ to disable type coercion. Use §c§computed_field§/c§ for derived properties included in serialisation.",
  gotchas: ["Pydantic v2 has breaking changes from v1 — §c§.dict()§/c§ is deprecated (use §c§.model_dump()§/c§), §c§.parse_obj()§/c§ is deprecated (use §c§.model_validate()§/c§)", "By default Pydantic coerces types: §c§'42'§/c§ is accepted for §c§int§/c§. Use §c§ConfigDict(strict=True)§/c§ to disable coercion"],
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
  summary: "pytest is Python's most popular test framework. Tests are functions starting with §c§test_§/c§. §c§assert§/c§ statements work natively. Fixtures (§c§@pytest.fixture§/c§) provide reusable setup with dependency injection. Parametrisation (§c§@pytest.mark.parametrize§/c§) runs one test with multiple inputs. Built-in fixtures: §c§tmp_path§/c§, §c§monkeypatch§/c§, §c§capsys§/c§, §c§capfd§/c§. §c§conftest.py§/c§ shares fixtures across files.",
  when_to_use: "Use §c§scope='session'§/c§ for expensive setup (DB connections) shared across all tests. Use §c§scope='function'§/c§ (default) for isolation. Use §c§pytest.approx()§/c§ for float comparisons. Use §c§monkeypatch.setenv()§/c§ for environment variables. Use §c§tmp_path§/c§ for temporary files.",
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
  summary: "SQLAlchemy 2.0 provides Core (SQL expression language) and ORM (object-relational mapping). 2.0 unified API: §c§Session.execute(select(Model))§/c§. Models inherit from §c§Base = DeclarativeBase()§/c§. Relationships use §c§Mapped[]§/c§ type annotations. Async support via §c§create_async_engine§/c§ and §c§AsyncSession§/c§. §c§selectinload()§/c§ / §c§joinedload()§/c§ for eager loading to avoid N+1 queries.",
  when_to_use: "Use ORM for application-level CRUD. Use Core for bulk operations and complex SQL. Use §c§with Session() as session:§/c§ to auto-close. Use §c§selectinload()§/c§ for relationships to avoid N+1. Use alembic for schema migrations.",
  gotchas: ["Lazy loading (default) triggers new SQL when accessing a relationship outside a session — causes §c§DetachedInstanceError§/c§. Use eager loading or access inside session", "SQLAlchemy 2.0 requires §c§session.execute(select(Model))§/c§ — the legacy §c§session.query(Model)§/c§ API is deprecated"],
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
}

};
