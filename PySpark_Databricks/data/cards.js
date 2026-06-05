// Pre-generated card detail data sourced from:
// - https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/
// - https://docs.delta.io/latest/
// - https://docs.databricks.com/en/dev-tools/databricks-utils.html

const CARD_DATA = {

  // ── IMPORTS ────────────────────────────────────────────────────────────
  "imports::core": {
    summary: "The three essential imports for every PySpark job. <code>SparkSession</code> is the entry point to Spark SQL. <code>functions as F</code> gives access to all built-in column functions. <code>Window</code> enables window (analytic) functions. The <code>types</code> wildcard pulls in all schema types.",
    when_to_use: "Put these at the top of every PySpark script or notebook. Import <code>F</code> aliased so all function calls are clearly namespaced as <code>F.col()</code>, <code>F.sum()</code>, etc., avoiding ambiguity with Python builtins.",
    gotchas: [
      "Never do <code>from pyspark.sql.functions import *</code> — it shadows Python builtins like <code>sum</code>, <code>min</code>, <code>max</code>, <code>round</code>",
      "Always alias as <code>F</code>: using bare function names makes it unclear whether you're calling a PySpark or Python function"
    ],
    example: `from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql import Window
from pyspark.sql.types import *

# All built-in functions are now accessed as F.*
df.select(F.col("name"), F.upper(F.col("city")))`
  },

  "imports::common types": {
    summary: "PySpark's type system maps directly to Spark SQL types and is used when defining explicit schemas or declaring UDF return types. <code>StructType</code> defines a row schema, <code>StructField</code> defines each column, and the primitive types (<code>StringType</code>, <code>IntegerType</code>, etc.) map to their SQL equivalents.",
    when_to_use: "Use explicit types when reading CSV/JSON with <code>inferSchema=False</code> for performance, when defining UDF return types, or when building schemas programmatically to avoid schema inference surprises in production pipelines.",
    gotchas: [
      "<code>IntegerType()</code> is 32-bit — use <code>LongType()</code> for large IDs or Unix timestamps to avoid overflow",
      "Type instances require parentheses: <code>StringType()</code> not <code>StringType</code>"
    ],
    example: `from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType

schema = StructType([
    StructField("user_id",  LongType(),   nullable=False),
    StructField("name",     StringType(), nullable=True),
    StructField("balance",  DoubleType(), nullable=True),
])

df = spark.read.schema(schema).csv("s3://bucket/users/", header=True)`
  },

  "imports::ml & streaming": {
    summary: "<code>pyspark.ml</code> is Spark's DataFrame-based ML library (successor to <code>mllib</code>). <code>Pipeline</code> chains transformers and estimators. <code>VectorAssembler</code> combines feature columns into a single vector column required by ML algorithms. <code>StreamingContext</code> is the entry point for legacy DStream-based streaming (prefer Structured Streaming for new work).",
    when_to_use: "Use <code>Pipeline</code> whenever you have more than one preprocessing step to ensure fit/transform consistency between training and inference. Use <code>VectorAssembler</code> as the final step before any ML estimator.",
    gotchas: [
      "ML pipelines must be fit on training data only — never the full dataset — to avoid data leakage",
      "<code>StreamingContext</code> is the legacy DStream API; for new projects use <code>spark.readStream</code> (Structured Streaming)"
    ],
    example: `from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.classification import RandomForestClassifier

assembler = VectorAssembler(
    inputCols=["age", "salary", "tenure"], outputCol="features")
scaler = StandardScaler(inputCol="features", outputCol="scaled_features")
rf = RandomForestClassifier(featuresCol="scaled_features", labelCol="churn")

pipeline = Pipeline(stages=[assembler, scaler, rf])
model = pipeline.fit(train_df)
predictions = model.transform(test_df)`
  },

  // ── SPARKSESSION ──────────────────────────────────────────────────────
  "sparksession::create / get": {
    summary: "<code>SparkSession</code> is the unified entry point for Spark SQL, DataFrame, and Dataset APIs, introduced in Spark 2.0 to replace <code>SQLContext</code> and <code>HiveContext</code>. <code>getOrCreate()</code> returns an existing session if one is active, making it safe to call multiple times in the same process.",
    when_to_use: "Use <code>getOrCreate()</code> in scripts and libraries so they work both standalone and inside an existing session (e.g. Databricks notebooks where <code>spark</code> is pre-initialised). In Databricks, never create a new session — just use the pre-existing <code>spark</code> variable.",
    gotchas: [
      "In Databricks, <code>spark</code> is pre-initialised — calling <code>SparkSession.builder...getOrCreate()</code> returns it; no new session is created",
      "<code>local[*]</code> uses all available CPU cores for local mode; for cluster mode remove the <code>.master()</code> call entirely"
    ],
    example: `from pyspark.sql import SparkSession

spark = (SparkSession
    .builder
    .appName("ETL Pipeline")
    .config("spark.sql.shuffle.partitions", "200")
    .config("spark.sql.adaptive.enabled", "true")
    .getOrCreate())

# Confirm session
print(spark.version)
sc = spark.sparkContext`
  },

  "sparksession::useful config": {
    summary: "<code>spark.conf.set/get</code> allows runtime configuration changes without restarting the session. Key configs include <code>spark.sql.shuffle.partitions</code> (default 200, often too high for small datasets), <code>spark.sql.adaptive.enabled</code> (AQE — auto-tunes partitions at runtime), and <code>spark.sql.autoBroadcastJoinThreshold</code>.",
    when_to_use: "Tune <code>shuffle.partitions</code> to 2–3× the number of cores for your cluster. Reduce it for small datasets to avoid task overhead. Set it to <code>-1</code> with AQE enabled to let Spark decide automatically.",
    gotchas: [
      "Some configs (like <code>spark.executor.memory</code>) cannot be changed at runtime — they must be set before session creation",
      "AQE (<code>spark.sql.adaptive.enabled</code>) is enabled by default in Spark 3.x — don't disable it without a good reason"
    ],
    example: `# Tune for a medium-sized cluster
spark.conf.set("spark.sql.shuffle.partitions", "64")
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")

# Read back to confirm
print(spark.conf.get("spark.sql.shuffle.partitions"))

# Stop the session cleanly when done (standalone scripts only)
spark.stop()`
  },

  // ── CREATING DATAFRAMES ───────────────────────────────────────────────
  "creating dataframes::from data": {
    summary: "<code>spark.createDataFrame()</code> creates a DataFrame from local Python data structures. It accepts lists of tuples, lists of dicts, Pandas DataFrames, and RDDs. When passing tuples, provide a <code>schema</code> list or <code>StructType</code>. When passing dicts, column names are inferred from keys.",
    when_to_use: "Use for unit testing, small lookup tables, or quick exploration. For any serious data volume, read from a file or table instead — <code>createDataFrame</code> collects data on the driver before distributing it.",
    gotchas: [
      "All data passes through the driver node first — never use this for large datasets",
      "When converting from Pandas, be aware of type mapping: Pandas <code>object</code> becomes <code>StringType</code>, <code>int64</code> becomes <code>LongType</code>"
    ],
    example: `# From tuples — schema as column names
df = spark.createDataFrame(
    [(1, "Alice", 30), (2, "Bob", 25)],
    schema=["id", "name", "age"])

# From dicts — schema inferred from keys
df = spark.createDataFrame([
    {"id": 1, "name": "Alice", "score": 98.5},
    {"id": 2, "name": "Bob",   "score": 87.0},
])

# From Pandas
import pandas as pd
pdf = pd.DataFrame({"a": [1, 2], "b": ["x", "y"]})
df = spark.createDataFrame(pdf)`
  },

  "creating dataframes::from files": {
    summary: "<code>spark.read</code> is a <code>DataFrameReader</code> that loads data from external storage. Supported formats include CSV, JSON (newline-delimited), Parquet, ORC, Avro, and text. Parquet is the recommended format for analytics — it is columnar, compressed, and stores schema. <code>inferSchema=True</code> on CSV triggers a full scan to determine types.",
    when_to_use: "Prefer Parquet or Delta for all internal data. Use CSV/JSON only for ingesting raw external data. Always provide an explicit schema in production to avoid inferSchema scans and schema drift.",
    gotchas: [
      "<code>inferSchema=True</code> on CSV reads the entire file twice — use explicit schema in production",
      "JSON reader expects newline-delimited JSON (NDJSON), not a JSON array — a single <code>[...]</code> file will fail"
    ],
    example: `# Parquet — preferred format
df = spark.read.parquet("s3://bucket/events/year=2024/")

# CSV with explicit schema (production-safe)
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
schema = StructType([
    StructField("user_id", StringType(), True),
    StructField("amount",  DoubleType(), True),
])
df = spark.read.schema(schema).option("header", "true").csv("s3://bucket/raw/")

# JSON (newline-delimited)
df = spark.read.json("s3://bucket/events/*.json")`
  },

  "creating dataframes::define schema": {
    summary: "<code>StructType</code> defines the schema of a DataFrame as an ordered list of <code>StructField</code> objects. Each field has a name, data type, and nullability flag. Schemas can be nested — a <code>StructField</code> can itself contain a <code>StructType</code>, <code>ArrayType</code>, or <code>MapType</code>.",
    when_to_use: "Define explicit schemas for all production CSV/JSON ingestion, UDF return types, and <code>createDataFrame</code> calls. This prevents inferSchema scans, protects against upstream schema changes, and makes pipeline intent explicit.",
    gotchas: [
      "<code>nullable=False</code> is not enforced at runtime — Spark will not throw an error if nulls appear; use it as documentation",
      "Column name matching during reads is case-insensitive by default — set <code>spark.sql.caseSensitive=true</code> if you need strict matching"
    ],
    example: `from pyspark.sql.types import (
    StructType, StructField,
    StringType, LongType, DoubleType, ArrayType, TimestampType)

# Nested schema with an array field
schema = StructType([
    StructField("order_id",   LongType(),   nullable=False),
    StructField("customer_id",LongType(),   nullable=False),
    StructField("placed_at",  TimestampType(), nullable=True),
    StructField("items", ArrayType(StructType([
        StructField("sku",      StringType(), True),
        StructField("quantity", LongType(),   True),
        StructField("price",    DoubleType(), True),
    ])), nullable=True),
])

df = spark.read.schema(schema).json("s3://bucket/orders/")`
  },

  // ── INSPECTION ────────────────────────────────────────────────────────
  "inspection & basic ops::inspect": {
    summary: "<code>show()</code> prints a formatted table to stdout (truncating long values by default). <code>printSchema()</code> prints the tree-structured schema with types and nullability. <code>describe()</code> computes count, mean, stddev, min, max for numeric columns — similar to Pandas <code>describe()</code>. <code>summary()</code> adds percentiles.",
    when_to_use: "Use <code>printSchema()</code> immediately after reading any new dataset to verify types. Use <code>describe()</code>/<code>summary()</code> for quick data quality checks. In Databricks prefer <code>display(df)</code> over <code>show()</code> for richer output.",
    gotchas: [
      "<code>count()</code> triggers a full scan — avoid calling it repeatedly; cache the DataFrame first if you need multiple actions",
      "<code>show()</code> truncates strings at 20 characters by default — use <code>show(truncate=False)</code> or <code>show(truncate=50)</code>"
    ],
    example: `# Schema and shape
df.printSchema()
print(f"Rows: {df.count():,}  Cols: {len(df.columns)}")

# Quick stats on all numeric columns
df.describe("price", "quantity", "discount").show()

# View with no truncation
df.show(10, truncate=False)

# Check nulls per column
from pyspark.sql import functions as F
df.select([
    F.count(F.when(F.isnull(c), c)).alias(c)
    for c in df.columns
]).show()`
  },

  "inspection & basic ops::select & filter": {
    summary: "<code>select()</code> projects a subset of columns (equivalent to SQL <code>SELECT</code>). <code>filter()</code> and <code>where()</code> are aliases for row filtering (equivalent to SQL <code>WHERE</code>). Both accept column expressions or SQL strings. Multiple conditions use <code>&</code> (AND), <code>|</code> (OR), <code>~</code> (NOT) — not Python <code>and/or/not</code>.",
    when_to_use: "Always select only the columns you need early in a pipeline — Parquet's columnar format means unneeded columns are never read. Use <code>F.col()</code> over <code>df.colname</code> to avoid ambiguity after joins where both DataFrames share a column name.",
    gotchas: [
      "Boolean conditions must be wrapped in parentheses: <code>(F.col('a') > 1) & (F.col('b') < 5)</code> — missing parens cause Python operator precedence bugs",
      "Using Python <code>and</code>/<code>or</code> instead of <code>&</code>/<code>|</code> raises a <code>ValueError</code> — Spark columns cannot be evaluated as Python booleans"
    ],
    example: `from pyspark.sql import functions as F

# Project specific columns with expressions
df.select(
    F.col("user_id"),
    F.col("email"),
    F.upper(F.col("country")).alias("country_upper")
)

# Multiple filter conditions (parentheses required!)
df.filter(
    (F.col("age") >= 18) &
    (F.col("status") == "active") &
    (F.col("country").isin("US", "GB", "CA"))
)

# SQL string style (useful for complex expressions)
df.where("price > 100 AND category = 'electronics'")`
  },

  "inspection & basic ops::add / rename / drop cols": {
    summary: "<code>withColumn()</code> adds a new column or replaces an existing one with an expression — it returns a new DataFrame (DataFrames are immutable). <code>withColumnRenamed()</code> renames a single column. <code>drop()</code> removes one or more columns. <code>cast()</code> changes a column's data type.",
    when_to_use: "Chain multiple <code>withColumn()</code> calls for readability, but be aware that each call creates a new query plan node. For adding many columns at once (10+), prefer a single <code>select()</code> with all expressions to avoid plan bloat.",
    gotchas: [
      "Chaining 50+ <code>withColumn()</code> calls can cause query plan analysis to slow significantly — batch them into a single <code>select()</code>",
      "If a column name passed to <code>withColumn()</code> already exists, the column is silently replaced — no error is raised"
    ],
    example: `from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType

df = (df
    # Add a new computed column
    .withColumn("revenue", F.col("price") * F.col("quantity"))
    # Add a conditional column
    .withColumn("tier",
        F.when(F.col("revenue") > 1000, "platinum")
         .when(F.col("revenue") > 500,  "gold")
         .otherwise("standard"))
    # Type cast
    .withColumn("year", F.col("year").cast(IntegerType()))
    # Rename
    .withColumnRenamed("ts", "event_timestamp")
    # Drop unneeded columns
    .drop("raw_payload", "internal_flag")
)`
  },

  // ── KEY FUNCTIONS ─────────────────────────────────────────────────────
  "key functions (f.*)::string": {
    summary: "PySpark's string functions mirror SQL string functions and operate element-wise on column values. They return a new <code>Column</code> expression. Key functions: <code>upper/lower</code> for case conversion, <code>trim</code> variants for whitespace, <code>split</code> returns an <code>ArrayType</code>, <code>regexp_replace/extract</code> for regex operations.",
    when_to_use: "Use these in <code>withColumn()</code> or <code>select()</code> for data cleaning and normalisation. <code>regexp_replace</code> is ideal for masking PII. <code>split</code> followed by <code>explode</code> is the standard pattern to unnest delimited fields.",
    gotchas: [
      "<code>split()</code> returns an <code>ArrayType</code> column — access elements with <code>F.col('arr')[0]</code> or use <code>explode()</code>",
      "<code>regexp_extract()</code> returns an empty string (not null) when no match is found — check with <code>F.when(F.col('x') == '', None)</code>"
    ],
    example: `from pyspark.sql import functions as F

df = (df
    # Normalise
    .withColumn("email", F.lower(F.trim(F.col("email"))))
    # Extract domain from email
    .withColumn("domain",
        F.regexp_extract(F.col("email"), r"@(.+)$", 1))
    # Mask phone number
    .withColumn("phone_masked",
        F.regexp_replace(F.col("phone"), r"\\d{4}$", "****"))
    # Split tags string into array
    .withColumn("tag_array",
        F.split(F.col("tags"), ","))
    # Concatenate columns
    .withColumn("full_name",
        F.concat_ws(" ", F.col("first_name"), F.col("last_name")))
)`
  },

  "key functions (f.*)::date & time": {
    summary: "PySpark's date/time functions work on <code>DateType</code> and <code>TimestampType</code> columns. <code>to_date()</code> and <code>to_timestamp()</code> parse strings using Java's <code>SimpleDateFormat</code> or ISO patterns. <code>datediff()</code> returns integer days. <code>date_format()</code> formats to any pattern string.",
    when_to_use: "Use <code>to_date()</code>/<code>to_timestamp()</code> immediately on ingestion to ensure correct typing. Use <code>year()</code>/<code>month()</code>/<code>dayofmonth()</code> for partitioning and time-based aggregations.",
    gotchas: [
      "Format strings use Java patterns, not Python's <code>strftime</code>: <code>yyyy-MM-dd</code> not <code>%Y-%m-%d</code>",
      "<code>current_timestamp()</code> returns the driver timestamp at plan creation time, not at executor execution time — use with care in distributed contexts"
    ],
    example: `from pyspark.sql import functions as F

df = (df
    # Parse string to date (Java format pattern)
    .withColumn("order_date",
        F.to_date(F.col("order_date_str"), "yyyy-MM-dd"))
    # Parse string to timestamp
    .withColumn("created_at",
        F.to_timestamp(F.col("created_str"), "yyyy-MM-dd HH:mm:ss"))
    # Days since order
    .withColumn("days_since_order",
        F.datediff(F.current_date(), F.col("order_date")))
    # Extract year/month for partitioning
    .withColumn("year",  F.year(F.col("order_date")))
    .withColumn("month", F.month(F.col("order_date")))
    # Format for display
    .withColumn("month_label",
        F.date_format(F.col("order_date"), "MMM yyyy"))
)`
  },

  "key functions (f.*)::math & logic": {
    summary: "<code>F.when(condition, value).otherwise(value)</code> is PySpark's vectorised if/else — equivalent to SQL <code>CASE WHEN</code>. <code>F.coalesce()</code> returns the first non-null value across columns. <code>F.lit()</code> creates a literal constant column. Math functions (<code>round</code>, <code>abs</code>, <code>pow</code>) operate element-wise.",
    when_to_use: "Use <code>when().otherwise()</code> for all conditional column logic — never use Python <code>if</code> in a DataFrame context. Chain multiple <code>.when()</code> calls for multi-branch conditions. Use <code>coalesce()</code> for null-safe fallback logic across columns.",
    gotchas: [
      "Omitting <code>.otherwise()</code> from a <code>when()</code> chain returns <code>null</code> for unmatched rows — always be explicit",
      "<code>F.round()</code> uses banker's rounding (round half to even) by default — if you need standard rounding, use <code>F.bround()</code>"
    ],
    example: `from pyspark.sql import functions as F

df = (df
    # Multi-branch conditional
    .withColumn("risk_tier",
        F.when(F.col("score") >= 750, "low")
         .when(F.col("score") >= 650, "medium")
         .when(F.col("score") >= 500, "high")
         .otherwise("very_high"))
    # Null-safe fallback
    .withColumn("effective_price",
        F.coalesce(F.col("sale_price"), F.col("list_price"), F.lit(0.0)))
    # Math
    .withColumn("price_rounded", F.round(F.col("price"), 2))
    .withColumn("discount_pct",
        F.round(F.col("discount") / F.col("list_price") * F.lit(100), 1))
)`
  },

  "key functions (f.*)::aggregate": {
    summary: "Aggregate functions reduce a group of rows to a single value. They are used inside <code>groupBy().agg()</code> or as window functions with <code>.over()</code>. <code>collect_list()</code> returns all values as an array (preserving duplicates); <code>collect_set()</code> returns unique values. <code>approx_count_distinct()</code> uses HyperLogLog for scalable cardinality estimation.",
    when_to_use: "Use <code>approx_count_distinct()</code> instead of <code>countDistinct()</code> on large datasets — it's O(1) memory vs O(n) and typically within 5% accuracy. Use <code>collect_list()</code> to pivot row values into arrays within a group.",
    gotchas: [
      "<code>collect_list()</code> and <code>collect_set()</code> collect all data for a group onto a single executor — can cause OOM on high-cardinality groups",
      "<code>count('*')</code> counts all rows including nulls; <code>count('col')</code> counts only non-null values in that column"
    ],
    example: `from pyspark.sql import functions as F

(df.groupBy("department", "month")
   .agg(
       F.count("*").alias("total_orders"),
       F.countDistinct("customer_id").alias("unique_customers"),
       F.approx_count_distinct("session_id").alias("approx_sessions"),
       F.sum("revenue").alias("total_revenue"),
       F.avg("order_value").alias("avg_order_value"),
       F.percentile_approx("order_value", 0.5).alias("median_order"),
       F.collect_set("country").alias("countries"),
   )
   .orderBy(F.desc("total_revenue"))
)`
  },

  "key functions (f.*)::array & map": {
    summary: "<code>explode()</code> transforms one row with an array into multiple rows (one per element) — the inverse of <code>collect_list()</code>. <code>explode_outer()</code> preserves rows with null/empty arrays (returning null). <code>posexplode()</code> also returns the element's index. <code>array_contains()</code> and <code>size()</code> work on array columns.",
    when_to_use: "Use <code>explode()</code> to unnest nested data (e.g. JSON arrays, collected lists). Use <code>explode_outer()</code> in ETL pipelines where you cannot afford to silently drop rows with empty arrays.",
    gotchas: [
      "<code>explode()</code> silently drops rows where the array is null or empty — use <code>explode_outer()</code> if you need to preserve them",
      "Exploding a large array column can cause severe data skew if array sizes vary widely — monitor task duration in the Spark UI"
    ],
    example: `from pyspark.sql import functions as F

# Unnest an array of items per order
line_items_df = (orders_df
    .select("order_id", "customer_id",
            F.explode("items").alias("item"))
    .select("order_id", "customer_id",
            F.col("item.sku").alias("sku"),
            F.col("item.quantity").alias("qty"),
            F.col("item.price").alias("price"))
)

# Filter rows where array contains a value
df.filter(F.array_contains(F.col("tags"), "premium"))

# Map operations
df.select(
    F.map_keys(F.col("metadata")).alias("meta_keys"),
    F.col("metadata")["source"].alias("source"),
)`
  },

  "key functions (f.*)::udf": {
    summary: "UDFs (User Defined Functions) allow arbitrary Python logic as a column transformation. Regular UDFs are slow — they serialise each row to Python, apply the function, and serialise back. Pandas UDFs (vectorised) operate on <code>pd.Series</code> batches using Apache Arrow, delivering 10–100× better performance.",
    when_to_use: "Always prefer built-in Spark functions over UDFs. When a UDF is unavoidable, always use a Pandas UDF. Reserve regular Python UDFs only for functions that cannot be expressed as pandas operations.",
    gotchas: [
      "Regular UDFs disable Catalyst optimisations — the optimiser treats them as black boxes and cannot push filters past them",
      "Pandas UDFs require <code>pyarrow</code> to be installed on all cluster nodes — verify this in Databricks cluster libraries",
      "UDFs cannot access Spark internals (no SparkContext, no reading other DataFrames) — they are pure row-level transformations"
    ],
    example: `from pyspark.sql import functions as F
from pyspark.sql.types import StringType, DoubleType
import pandas as pd

# ✗ Avoid: regular UDF (slow, no Catalyst optimisation)
@F.udf(StringType())
def slow_udf(val):
    return val.strip().upper() if val else None

# ✓ Prefer: Pandas UDF (vectorised via Arrow)
@F.pandas_udf(DoubleType())
def calculate_score(
    amount: pd.Series,
    days: pd.Series
) -> pd.Series:
    return (amount / days.clip(lower=1)) * 100

df.withColumn("score",
    calculate_score(F.col("amount"), F.col("days_active")))`
  },

  // ── GROUPBY ───────────────────────────────────────────────────────────
  "groupby & aggregations::groupby": {
    summary: "<code>groupBy()</code> groups rows by one or more column values and returns a <code>GroupedData</code> object. Call <code>.agg()</code> on it with named aggregate expressions, or call shorthand methods like <code>.count()</code>, <code>.sum()</code>, <code>.mean()</code>. <code>.pivot()</code> rotates distinct values of a column into new columns (like Excel pivot tables).",
    when_to_use: "Use <code>.agg()</code> with <code>.alias()</code> for readable output column names. Use <code>.pivot()</code> to reshape narrow data into wide format for reporting — but specify the pivot values explicitly to avoid a full scan for distinct values.",
    gotchas: [
      "<code>pivot()</code> without explicit values triggers a full scan to find distinct values — always pass them explicitly: <code>.pivot('month', ['Jan','Feb','Mar'])</code>",
      "After <code>groupBy().agg()</code>, grouped columns appear first — the output schema may differ from input"
    ],
    example: `from pyspark.sql import functions as F

# Multi-column groupBy with named aggregates
summary_df = (df
    .groupBy("region", "product_category")
    .agg(
        F.count("order_id").alias("order_count"),
        F.sum("revenue").alias("total_revenue"),
        F.avg("discount_pct").alias("avg_discount"),
        F.max("order_date").alias("last_order_date"),
    )
    .orderBy(F.desc("total_revenue"))
)

# Pivot: one row per customer, one column per month
monthly = (df
    .groupBy("customer_id")
    .pivot("month", ["Jan", "Feb", "Mar", "Apr"])
    .sum("revenue")
)`
  },

  "groupby & aggregations::window functions": {
    summary: "Window functions compute a value for each row based on a group of related rows (the 'window') without collapsing rows like <code>groupBy()</code>. The <code>Window</code> spec defines the partition (like GROUP BY), ordering, and optional frame bounds. Common functions: <code>rank()</code>, <code>dense_rank()</code>, <code>row_number()</code>, <code>lag()</code>, <code>lead()</code>, running totals.",
    when_to_use: "Use window functions to add rankings, running totals, or lagged values to each row while keeping all rows. The classic use case is 'top N per group' using <code>row_number()</code> filtered to <code>rn == 1</code>.",
    gotchas: [
      "Window functions with large partitions (high-cardinality keys) can cause OOM — all rows in a partition must fit on one executor",
      "<code>rank()</code> leaves gaps after ties (1,1,3); <code>dense_rank()</code> does not (1,1,2); <code>row_number()</code> is always unique",
      "Omitting <code>partitionBy()</code> makes the whole DataFrame one partition — never do this on large data"
    ],
    example: `from pyspark.sql import Window, functions as F

# Partition by department, order by salary descending
w = Window.partitionBy("department").orderBy(F.desc("salary"))

ranked = (employees_df
    .withColumn("rank",         F.rank().over(w))
    .withColumn("dense_rank",   F.dense_rank().over(w))
    .withColumn("row_num",      F.row_number().over(w))
    .withColumn("prev_salary",  F.lag("salary", 1).over(w))
    .withColumn("salary_delta", F.col("salary") - F.lag("salary", 1).over(w))
)

# Top earner per department
top_per_dept = ranked.filter(F.col("row_num") == 1)

# Running 7-day revenue total (frame-based window)
w_rolling = (Window
    .partitionBy("store_id")
    .orderBy("date")
    .rowsBetween(-6, 0))
df.withColumn("revenue_7d", F.sum("revenue").over(w_rolling))`
  },

  // ── JOINS ─────────────────────────────────────────────────────────────
  "joins, sort & dedup::joins": {
    summary: "PySpark supports all standard SQL join types. <code>left_semi</code> returns only left rows that have a match (like <code>WHERE EXISTS</code>). <code>left_anti</code> returns only left rows with no match (like <code>WHERE NOT EXISTS</code>). Broadcast joins avoid shuffling the large table by replicating the small table to every executor — critical for performance when joining a large table to a small lookup.",
    when_to_use: "Use <code>F.broadcast()</code> for any table under ~100MB (configurable via <code>spark.sql.autoBroadcastJoinThreshold</code>). Spark will auto-broadcast below the threshold, but explicit broadcast hints override it. Use <code>left_semi</code> instead of inner join when you only need columns from the left table.",
    gotchas: [
      "After joining on column names (not expressions), the join key appears only once. After joining on expressions (<code>df1.id == df2.user_id</code>), both columns appear — drop duplicates explicitly",
      "Joining two DataFrames that were derived from the same source can cause incorrect results due to plan reuse — cache or repartition one side if needed"
    ],
    example: `from pyspark.sql import functions as F

# Inner join on shared column name (key column appears once)
orders_with_customers = (orders_df
    .join(customers_df, on="customer_id", how="inner"))

# Left join on expression (both columns kept — rename/drop needed)
enriched = (events_df
    .join(users_df,
          events_df.user_id == users_df.id,
          how="left")
    .drop(users_df.id))

# Broadcast join for small lookup table
from pyspark.sql.functions import broadcast
result = (large_df
    .join(broadcast(country_codes_df), on="country_code", how="left"))

# Anti-join: find orders with no matching customer
orphaned = orders_df.join(customers_df, on="customer_id", how="left_anti")`
  },

  "joins, sort & dedup::sort, dedup & null": {
    summary: "<code>dropDuplicates()</code> removes duplicate rows based on all or a subset of columns. <code>dropna()</code> removes rows with null values, optionally in specific columns. <code>fillna()</code> replaces nulls with a constant or column-level defaults. <code>orderBy()</code>/<code>sort()</code> are aliases — both trigger a full sort (expensive operation).",
    when_to_use: "Use <code>dropDuplicates(['id'])</code> to deduplicate by key rather than all columns. Use <code>fillna({'col': default})</code> to apply different defaults per column. Avoid sorting unless required for output — prefer <code>orderBy()</code> only at the final stage of a pipeline.",
    gotchas: [
      "<code>orderBy()</code>/<code>sort()</code> collects all data into a single partition for sorting — use only when necessary and as the last transformation",
      "<code>dropDuplicates()</code> keeps an arbitrary row among duplicates — if you need the latest row, use <code>row_number()</code> window function instead"
    ],
    example: `from pyspark.sql import functions as F

# Dedup by key (keep arbitrary row per key)
deduped = df.dropDuplicates(["user_id", "event_date"])

# Keep most recent row per user (deterministic)
from pyspark.sql import Window
w = Window.partitionBy("user_id").orderBy(F.desc("event_ts"))
latest = (df
    .withColumn("rn", F.row_number().over(w))
    .filter(F.col("rn") == 1)
    .drop("rn"))

# Null handling
clean = (df
    .dropna(subset=["user_id", "event_type"])   # drop rows missing key fields
    .fillna({"country": "UNKNOWN",
             "amount":  0.0,
             "score":   -1})                     # fill by column
)

# Sort only at output
final = df.orderBy(F.desc("revenue"), F.asc("region"))`
  },

  "joins, sort & dedup::set ops & union": {
    summary: "<code>union()</code> stacks two DataFrames by column position (both must have same number of columns). <code>unionByName()</code> matches by column name (safer, allows different column order). <code>intersect()</code> returns rows present in both. <code>subtract()</code> returns rows in the first DataFrame not in the second. All set operations return distinct rows except <code>unionAll()</code>.",
    when_to_use: "Always prefer <code>unionByName()</code> over <code>union()</code> — positional matching silently produces wrong results if schemas differ. Use <code>unionByName(allowMissingColumns=True)</code> (Spark 3.1+) when schemas partially overlap.",
    gotchas: [
      "<code>union()</code> matches by position, not name — if column order differs between DataFrames, data will be silently mixed up",
      "Set operations like <code>intersect()</code> and <code>subtract()</code> perform a shuffle to find duplicates — they are expensive on large DataFrames"
    ],
    example: `# Safe union by name (Spark 3.1+ allows missing columns)
combined = df_jan.unionByName(df_feb, allowMissingColumns=True)

# Combine multiple monthly files
from functools import reduce
monthly_dfs = [spark.read.parquet(f"s3://bucket/month={m}/") for m in months]
all_data = reduce(lambda a, b: a.unionByName(b), monthly_dfs)

# Rows in current but not in previous snapshot (new/changed rows)
new_rows = current_df.subtract(previous_df)

# Rows present in both (for reconciliation)
common = current_df.intersect(previous_df)

# Limit output for sampling
df.limit(1000).toPandas()`
  },

  // ── SQL ───────────────────────────────────────────────────────────────
  "sql interface::register & query": {
    summary: "<code>createOrReplaceTempView()</code> registers a DataFrame as a temporary SQL table scoped to the current SparkSession. <code>createOrReplaceGlobalTempView()</code> registers it in the global <code>global_temp</code> database, visible across sessions on the same cluster. <code>spark.sql()</code> executes any SQL string and returns a DataFrame.",
    when_to_use: "Use temp views when you have complex multi-step SQL that's cleaner to write in SQL than DataFrame API, or when handing data off to SQL-oriented team members. Use <code>spark.sql()</code> for DDL operations (<code>CREATE TABLE</code>, <code>OPTIMIZE</code>, <code>VACUUM</code>) that have no DataFrame API equivalent.",
    gotchas: [
      "Temp views are session-scoped — they disappear when the SparkSession ends or the notebook is detached",
      "Global temp views are accessed as <code>global_temp.view_name</code> in SQL — the schema prefix is required"
    ],
    example: `# Register and query
df.createOrReplaceTempView("orders")
customers_df.createOrReplaceTempView("customers")

result = spark.sql("""
    SELECT
        c.region,
        DATE_TRUNC('month', o.order_date) AS month,
        COUNT(DISTINCT o.customer_id)     AS unique_buyers,
        SUM(o.revenue)                    AS total_revenue,
        AVG(o.order_value)                AS avg_order
    FROM orders o
    JOIN customers c USING (customer_id)
    WHERE o.order_date >= '2024-01-01'
    GROUP BY 1, 2
    ORDER BY 1, 2
""")

# Inject Python variable into SQL (f-string)
start_date = "2024-01-01"
df = spark.sql(f"SELECT * FROM orders WHERE order_date >= '{start_date}'")`
  },

  "sql interface::catalog": {
    summary: "The <code>Catalog</code> API (<code>spark.catalog</code>) provides programmatic access to database metadata — listing tables, columns, databases, and managing table caches. It wraps the Hive Metastore or Unity Catalog depending on your Spark environment. Useful for building dynamic pipelines that discover tables at runtime.",
    when_to_use: "Use <code>tableExists()</code> in idempotent pipelines before creating or dropping tables. Use <code>listTables()</code> / <code>listColumns()</code> in metadata-driven frameworks that process tables dynamically.",
    gotchas: [
      "In Databricks with Unity Catalog, use the three-part name <code>catalog.schema.table</code> — <code>listTables()</code> operates on the current database unless you specify one",
      "<code>spark.catalog.clearCache()</code> clears all cached tables — use <code>spark.catalog.uncacheTable('name')</code> to target a specific table"
    ],
    example: `# Check existence before creating
if not spark.catalog.tableExists("my_db.processed_events"):
    df.write.saveAsTable("my_db.processed_events")

# List all tables in a database
tables = spark.catalog.listTables("my_db")
for t in tables:
    print(f"{t.name} ({t.tableType})")

# Introspect schema of an existing table
cols = spark.catalog.listColumns("my_db", "processed_events")
for c in cols:
    print(f"  {c.name}: {c.dataType} nullable={c.nullable}")`
  },

  // ── WRITE ─────────────────────────────────────────────────────────────
  "writing data::save modes & formats": {
    summary: "The <code>DataFrameWriter</code> API supports four save modes: <code>overwrite</code> (replace existing data), <code>append</code> (add rows), <code>ignore</code> (no-op if exists), <code>error</code>/<code>errorIfExists</code> (default — raise error if exists). Parquet is the recommended format. <code>partitionBy()</code> writes data into directory partitions (Hive-style), enabling partition pruning on reads.",
    when_to_use: "Always partition large tables by high-cardinality date/region columns that are frequently used as filters. Partition by low-cardinality columns only — partitioning by user_id creates millions of tiny files. Use <code>overwrite</code> mode with <code>partitionOverwriteMode=dynamic</code> to replace only affected partitions.",
    gotchas: [
      "<code>mode('overwrite')</code> on a partitioned table with dynamic partition overwrite enabled replaces only the partitions present in the DataFrame — set <code>spark.conf.set('spark.sql.sources.partitionOverwriteMode', 'dynamic')</code>",
      "Writing too many small files is a common performance killer — always <code>repartition()</code> or <code>coalesce()</code> to a reasonable number before writing"
    ],
    example: `# Write partitioned Parquet (recommended for large tables)
(df
    .repartition("year", "month")          # co-locate by partition key
    .write
    .mode("overwrite")
    .partitionBy("year", "month")
    .parquet("s3://bucket/processed/events/"))

# Append to existing partitioned table
(new_events_df
    .write
    .mode("append")
    .partitionBy("date")
    .parquet("s3://bucket/processed/events/"))

# Write single file for downstream tools
(df.coalesce(1)
   .write
   .mode("overwrite")
   .option("header", "true")
   .csv("s3://bucket/reports/daily_summary/"))`
  },

  "writing data::save as table / jdbc": {
    summary: "<code>saveAsTable()</code> writes data and registers it in the Spark/Hive Metastore as a managed table. <code>insertInto()</code> appends to an existing table by column position. JDBC write uses a JDBC driver to write to relational databases. The table format defaults to Parquet unless Delta is configured.",
    when_to_use: "Use <code>saveAsTable()</code> when you want the table to be queryable by name after the job. Use JDBC for pushing aggregated results back to a relational data warehouse (Postgres, MySQL, SQL Server) — not for large-scale writes due to JDBC throughput limits.",
    gotchas: [
      "<code>insertInto()</code> inserts by column position, not name — column order in the DataFrame must exactly match the table schema",
      "JDBC writes are single-threaded by default — set <code>numPartitions</code> and ensure the target table has no unique constraints that would cause conflicts on parallel writes"
    ],
    example: `# Save as Delta table in Unity Catalog
(df.write
   .mode("overwrite")
   .format("delta")
   .option("overwriteSchema", "true")
   .saveAsTable("catalog.schema.processed_events"))

# JDBC write to PostgreSQL
(summary_df
    .write
    .format("jdbc")
    .options(
        url="jdbc:postgresql://host:5432/analytics",
        dbtable="public.daily_summary",
        user="etl_user",
        password=dbutils.secrets.get("scope", "pg-password"),
        driver="org.postgresql.Driver",
        numPartitions="8",
        batchsize="10000",
    )
    .mode("overwrite")
    .save())`
  },

  // ── PERFORMANCE ───────────────────────────────────────────────────────
  "performance tips::caching & partitions": {
    summary: "<code>cache()</code> stores a DataFrame in memory (deserialized JVM objects). <code>persist()</code> allows specifying the storage level: <code>MEMORY_ONLY</code>, <code>MEMORY_AND_DISK</code> (default), <code>DISK_ONLY</code>, etc. <code>repartition(n)</code> performs a full shuffle; <code>coalesce(n)</code> merges partitions without a shuffle (only reduces partition count).",
    when_to_use: "Cache a DataFrame when it's used in multiple downstream actions (e.g. both a count and a write). Repartition before a wide join or shuffle-heavy operation to control parallelism. Use <code>coalesce()</code> before writing to reduce small output files.",
    gotchas: [
      "Caching is lazy — the DataFrame is not actually cached until the first action. Call <code>df.cache().count()</code> to force materialisation",
      "<code>coalesce()</code> can only reduce partitions, not increase them — and the resulting partitions may be unequal in size, causing skew"
    ],
    example: `from pyspark import StorageLevel

# Cache for multiple reuse (force materialisation immediately)
filtered_df = df.filter(F.col("status") == "active").cache()
filtered_df.count()   # triggers caching

# Use multiple times without re-computing
count_by_region = filtered_df.groupBy("region").count()
top_customers    = filtered_df.orderBy(F.desc("ltv")).limit(100)

filtered_df.unpersist()   # release memory when done

# Persist to disk for very large DataFrames
large_df.persist(StorageLevel.MEMORY_AND_DISK_DESER)

# Repartition before a heavy join
left_df  = orders_df.repartition(200, "customer_id")
right_df = events_df.repartition(200, "customer_id")
joined   = left_df.join(right_df, on="customer_id")

# Coalesce before writing to control file count
df.coalesce(8).write.parquet("s3://bucket/output/")`
  },

  "performance tips::explain & debug": {
    summary: "<code>explain()</code> prints the query execution plan — from the unresolved logical plan through to the final physical plan. The physical plan shows what Spark actually executes: scan types, join strategies (BroadcastHashJoin, SortMergeJoin), exchange (shuffle) operations, and filter pushdowns. The Spark UI at port 4040 provides the full visual DAG, stage details, and task metrics.",
    when_to_use: "Run <code>explain('formatted')</code> when a job is slower than expected — look for missing filter pushdowns, unexpected SortMergeJoins (vs BroadcastHashJoins), and unnecessary shuffles (<code>Exchange</code> nodes). In Databricks, use the built-in query plan visualiser.",
    gotchas: [
      "A plan with many consecutive <code>Project</code> nodes from chained <code>withColumn()</code> calls can slow plan analysis — batch into a single <code>select()</code>",
      "<code>Exchange</code> in the physical plan means a shuffle — each shuffle writes to disk and sends data over the network, making it the most expensive operation"
    ],
    example: `# Show full formatted plan (easiest to read)
df.groupBy("region").agg(F.sum("revenue")).explain("formatted")

# Key things to look for in the plan:
# ✓ FileScan with PartitionFilters: [...] = partition pruning working
# ✓ BroadcastHashJoin = no shuffle for joins
# ✗ SortMergeJoin = full shuffle both sides
# ✗ Exchange (shuffle) = data redistribution across nodes

# Check partition count and size
print(f"Partitions: {df.rdd.getNumPartitions()}")

# Set log level for noise reduction
spark.sparkContext.setLogLevel("WARN")

# In Databricks: Spark UI available via cluster UI → Spark UI tab`
  },

  // ── DATABRICKS: MAGIC COMMANDS ────────────────────────────────────────
  "notebook magic commands::cell-level language switching": {
    summary: "Databricks notebook magic commands are single-line directives prefixed with <code>%</code> that change the execution context for an entire cell. <code>%sql</code> runs the cell as Spark SQL. <code>%sh</code> runs shell commands on the driver node. <code>%md</code> renders Markdown. <code>%run</code> executes another notebook inline, sharing its variables and functions with the current notebook.",
    when_to_use: "Use <code>%sql</code> for DDL (<code>OPTIMIZE</code>, <code>VACUUM</code>, <code>CREATE TABLE</code>) and ad-hoc SQL queries. Use <code>%sh</code> to install system packages, check disk usage, or debug driver-side file issues. Use <code>%run</code> to import shared utility notebooks (config, helper functions).",
    gotchas: [
      "<code>%sh</code> only runs on the driver — it does not execute on worker nodes. Use <code>sc.parallelize</code> with subprocess calls if you need to run shell commands on workers",
      "<code>%run</code> executes the target notebook in the current scope — all variables defined in the child notebook become available in the parent, which can cause naming collisions"
    ],
    example: `# In a cell: run SQL directly
# %sql
# SELECT region, SUM(revenue) AS total
# FROM catalog.schema.orders
# GROUP BY 1
# ORDER BY 2 DESC

# In a cell: install a package then restart Python
# %pip install great-expectations==0.18.0

# In a cell: run a shared utilities notebook
# %run ./utils/common_functions

# After %run, functions from common_functions are available:
# result = transform_events(df, config)

# In a cell: shell commands on driver
# %sh
# du -sh /dbfs/FileStore/tables/
# pip list | grep delta`
  },

  "notebook magic commands::install & config": {
    summary: "<code>%pip install</code> installs Python packages into the notebook's Python environment on all cluster nodes via pip. It automatically restarts the Python interpreter after installation. <code>dbutils.library.restartPython()</code> explicitly restarts the Python interpreter, which is required after <code>%pip install</code> in some DBR versions to ensure the new package is importable.",
    when_to_use: "Use <code>%pip install</code> for per-notebook dependencies. For cluster-wide dependencies that all notebooks need, install libraries via the cluster Libraries tab or an init script instead — <code>%pip</code> adds per-run overhead and doesn't persist after cluster restart.",
    gotchas: [
      "<code>%pip install</code> restarts the Python process — any variables defined before the install cell are lost. Structure notebooks so all installs come before any computation",
      "Packages installed with <code>%pip</code> are not available in Scala or R cells — each language has its own environment"
    ],
    example: `# Install specific version (in first notebook cell)
# %pip install delta-spark==3.2.0 great-expectations==0.18.12

# Requirements file (checked into your repo)
# %pip install -r /Workspace/Repos/my-project/requirements.txt

# After pip install in older DBR, explicitly restart:
# dbutils.library.restartPython()

# Inline matplotlib config for crisp Retina display
# %config InlineBackend.figure_format = 'retina'
# %matplotlib inline

import matplotlib.pyplot as plt
plt.style.use('dark_background')`
  },

  // ── DATABRICKS: DISPLAY ────────────────────────────────────────────────
  "display & output::display functions": {
    summary: "<code>display(df)</code> renders a DataFrame as an interactive table in Databricks notebooks with sorting, filtering, pagination, and built-in chart builder. It supports DataFrames, Pandas DataFrames, Matplotlib figures, Plotly charts, and images. <code>displayHTML()</code> renders arbitrary HTML/CSS/JS inline in the notebook output.",
    when_to_use: "Always use <code>display()</code> instead of <code>df.show()</code> in Databricks notebooks — it provides far richer output and doesn't truncate columns. Use <code>display()</code> after any aggregation to get instant charting without writing extra code.",
    gotchas: [
      "<code>display()</code> collects data to the driver — for very large DataFrames, always <code>.limit()</code> first to avoid OOM on the driver",
      "<code>display()</code> is Databricks-specific and not available in standalone PySpark — code using it will fail outside Databricks"
    ],
    example: `# Interactive table (use instead of .show() in Databricks)
display(df.limit(1000))

# Instant bar chart: pass a grouped DataFrame
display(
    df.groupBy("region", "product_category")
      .agg(F.sum("revenue").alias("total_revenue"))
)
# Click the chart icon in output to switch to bar/line/pie chart

# Render Matplotlib in notebook
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(x_vals, y_vals)
display(fig)

# Embed HTML (e.g. custom status indicator)
displayHTML("""
  <div style='padding:12px;background:#1e1e26;color:#34d399;
              font-family:monospace;border-radius:8px'>
    ✓ Pipeline completed in 4m 32s
  </div>
""")`
  },

  "display & output::widgets (notebook params)": {
    summary: "Databricks widgets are interactive UI controls (text inputs, dropdowns, multiselects) that appear in the notebook toolbar. They parameterise notebooks for reuse — allowing the same notebook to run with different dates, environments, or filters without code changes. Widget values are always strings.",
    when_to_use: "Use widgets when a notebook is run repeatedly with different parameters (e.g. a daily report notebook with a configurable date range). Use <code>dbutils.notebook.run(path, timeout, arguments)</code> to pass widget values programmatically when orchestrating from a parent notebook or Databricks Workflow.",
    gotchas: [
      "Widget values are always strings — cast them explicitly: <code>int(dbutils.widgets.get('year'))</code>",
      "Widgets created with <code>dbutils.widgets.text()</code> in a re-run cell accumulate — call <code>dbutils.widgets.removeAll()</code> at the top of the notebook to prevent stale widgets"
    ],
    example: `# Define widgets at top of notebook
dbutils.widgets.removeAll()   # clean slate on re-run
dbutils.widgets.text("start_date", "2024-01-01", "Start Date")
dbutils.widgets.dropdown("environment", "prod",
    ["dev", "staging", "prod"], "Environment")
dbutils.widgets.multiselect("regions", "US",
    ["US", "EU", "APAC", "LATAM"], "Regions")

# Read values (always strings — cast as needed)
start_date  = dbutils.widgets.get("start_date")
environment = dbutils.widgets.get("environment")
regions     = dbutils.widgets.get("regions").split(",")

# Use in query
df = spark.sql(f"""
    SELECT * FROM {environment}.orders
    WHERE order_date >= '{start_date}'
      AND region IN ({','.join(f"'{r}'" for r in regions)})
""")`
  },

  // ── DBUTILS ───────────────────────────────────────────────────────────
  "dbutils::file system (dbutils.fs)": {
    summary: "<code>dbutils.fs</code> provides a file system API for DBFS (Databricks File System), Unity Catalog Volumes, and cloud storage (S3, ADLS, GCS). It wraps underlying cloud storage APIs with a unified interface. DBFS paths use <code>dbfs:/</code> prefix; Volume paths use <code>/Volumes/</code>. All paths within DBFS are also accessible at <code>/dbfs/</code> from driver-side Python file I/O.",
    when_to_use: "Use <code>dbutils.fs.ls()</code> to inspect data landing zones. Use <code>dbutils.fs.cp()</code>/<code>mv()</code> to move files through pipeline stages. Use <code>dbutils.fs.rm(recurse=True)</code> to clean up temp outputs. Prefer Unity Catalog Volumes over raw DBFS for all new data.",
    gotchas: [
      "DBFS is a legacy abstraction — for new projects, use Unity Catalog Volumes (<code>/Volumes/catalog/schema/vol/</code>) for proper governance and access control",
      "<code>dbutils.fs</code> operations are not atomic — a failed <code>cp</code> may leave a partial file. Always validate after copy with a size or checksum check"
    ],
    example: `# List a Volume
files = dbutils.fs.ls("/Volumes/prod/raw/uploads/")
for f in files:
    print(f"{f.name}  {f.size:,} bytes  {f.modificationTime}")

# Copy from landing zone to processed area
dbutils.fs.cp(
    "/Volumes/prod/raw/uploads/data_20240101.csv",
    "/Volumes/prod/processed/data_20240101.csv")

# Move to archive after processing
dbutils.fs.mv(
    "/Volumes/prod/processed/data_20240101.csv",
    "/Volumes/prod/archive/data_20240101.csv")

# Recursive delete of temp directory
dbutils.fs.rm("/Volumes/prod/tmp/scratch/", recurse=True)

# Preview first 512 bytes of a file
print(dbutils.fs.head("/Volumes/prod/raw/config.json", 512))`
  },

  "dbutils::secrets": {
    summary: "The Databricks Secrets API stores sensitive credentials (API keys, passwords, connection strings) in an encrypted vault backed by Azure Key Vault or Databricks' own secret store. <code>dbutils.secrets.get()</code> retrieves a secret by scope and key. Critically, secret values are automatically redacted from notebook output — printing a secret shows <code>[REDACTED]</code>.",
    when_to_use: "Always retrieve credentials via <code>dbutils.secrets.get()</code> — never hardcode credentials in notebooks, scripts, or Repos. Use secrets in JDBC connection strings, Spark configs for cloud storage access keys, and API authentication headers.",
    gotchas: [
      "Secrets are redacted in output but are accessible in memory — don't pass them to functions that log their arguments",
      "<code>dbutils.secrets.get()</code> only works inside a Databricks notebook or job — it cannot be called from a local IDE or CI system without Databricks Connect"
    ],
    example: `# Retrieve credentials
db_password  = dbutils.secrets.get(scope="prod-secrets", key="pg-password")
storage_key  = dbutils.secrets.get(scope="prod-secrets", key="adls-access-key")
api_token    = dbutils.secrets.get(scope="prod-secrets", key="slack-webhook")

# Use in Spark config (for ADLS access)
spark.conf.set(
    "fs.azure.account.key.myadlsaccount.dfs.core.windows.net",
    dbutils.secrets.get("prod-secrets", "adls-key"))

# Use in JDBC connection
jdbc_url = (
    f"jdbc:postgresql://db.company.com:5432/analytics"
    f"?user=etl_user&password={db_password}"
)

# List available scopes and keys (names only — values never exposed)
for scope in dbutils.secrets.listScopes():
    print(f"Scope: {scope.name}")
    for secret in dbutils.secrets.list(scope.name):
        print(f"  Key: {secret.key}")`
  },

  "dbutils::notebook control": {
    summary: "<code>dbutils.notebook.run()</code> executes another notebook as a sub-job synchronously, passing arguments as a dict and receiving a return value as a string. It can be used for modular notebook pipelines. <code>dbutils.notebook.exit()</code> terminates the current notebook and returns a value to the calling notebook or Workflow.",
    when_to_use: "Use <code>dbutils.notebook.run()</code> to build fan-out pipelines where a parent notebook triggers child notebooks in parallel (using Python <code>concurrent.futures</code>). Prefer Databricks Workflows for production orchestration — notebook-level orchestration is harder to monitor and retry.",
    gotchas: [
      "<code>dbutils.notebook.run()</code> is synchronous and blocks — use <code>concurrent.futures.ThreadPoolExecutor</code> to run multiple child notebooks in parallel",
      "Return values from <code>exit()</code> are strings only — serialise complex results to JSON: <code>dbutils.notebook.exit(json.dumps(result_dict))</code>"
    ],
    example: `import json
from concurrent.futures import ThreadPoolExecutor, as_completed

# Define child notebooks to run in parallel
tasks = [
    {"notebook": "./process_region", "params": {"region": "US",   "date": "2024-01-01"}},
    {"notebook": "./process_region", "params": {"region": "EU",   "date": "2024-01-01"}},
    {"notebook": "./process_region", "params": {"region": "APAC", "date": "2024-01-01"}},
]

def run_notebook(task):
    result = dbutils.notebook.run(
        task["notebook"],
        timeout_seconds=3600,
        arguments=task["params"])
    return json.loads(result)

# Run all regions in parallel
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(run_notebook, t): t for t in tasks}
    for future in as_completed(futures):
        print(future.result())

# In a child notebook, signal completion:
# dbutils.notebook.exit(json.dumps({"status": "ok", "rows": row_count}))`
  },

  "dbutils::help & discovery": {
    summary: "<code>dbutils.help()</code> and the module-level <code>.help()</code> methods print inline documentation for every command in that module, including parameter names and types. This is the fastest way to discover available commands without leaving the notebook.",
    when_to_use: "Run <code>dbutils.help()</code> whenever you're unsure what's available. Run <code>dbutils.fs.help()</code>, <code>dbutils.secrets.help()</code> etc. for command-specific docs. <code>dbutils.library.restartPython()</code> is the correct way to restart the Python process after pip installs.",
    gotchas: [
      "<code>dbutils.library.restartPython()</code> resets all Python state — any DataFrames, variables, and imports defined before the restart are gone",
      "Help output is printed to stdout — in Databricks notebooks it appears inline; in automated jobs it goes to driver logs"
    ],
    example: `# Discover all available dbutils modules
dbutils.help()
# Output: fs, secrets, widgets, notebook, library, ...

# Get commands for a specific module
dbutils.fs.help()
dbutils.secrets.help()
dbutils.widgets.help()
dbutils.notebook.help()

# Restart Python after %pip install (all state is reset)
dbutils.library.restartPython()

# Pattern: put restartPython at end of install cell,
# compute starts fresh in subsequent cells
# (do NOT call it inside a try/except — it raises SystemExit)`
  },

  // ── DELTA LAKE ────────────────────────────────────────────────────────
  "delta lake::read & write delta": {
    summary: "Delta Lake is a storage layer built on Parquet that adds ACID transactions, schema enforcement, time travel, and audit history to data lakes. In Databricks, <code>delta</code> is the default format for all tables. Data is stored as Parquet files plus a <code>_delta_log/</code> directory containing JSON transaction logs. <code>DeltaTable.forName()</code> / <code>forPath()</code> creates a handle for DML operations.",
    when_to_use: "Use Delta for all tables in Databricks — it is the default and provides ACID guarantees, schema evolution, and time travel at no extra cost. Use <code>spark.read.table()</code> for Unity Catalog tables (3-part name), <code>forPath()</code> for path-based access.",
    gotchas: [
      "Delta tables created with <code>saveAsTable()</code> are managed by the metastore — dropping the table also deletes the data. Tables created with <code>save(path)</code> are external — dropping the table leaves data intact",
      "Schema enforcement is enabled by default — writing a DataFrame with extra or mismatched columns raises an <code>AnalysisException</code>. Use <code>mergeSchema</code> or <code>overwriteSchema</code> options to evolve the schema"
    ],
    example: `from delta.tables import DeltaTable
from pyspark.sql import functions as F

# Read from Unity Catalog (3-part name)
df = spark.read.table("prod.sales.orders")

# Read from path
df = spark.read.format("delta").load("abfss://container@account/delta/orders/")

# Write with schema evolution enabled
(df.write
   .format("delta")
   .mode("overwrite")
   .option("overwriteSchema", "true")
   .saveAsTable("prod.sales.orders"))

# Append new partition (schema must match)
(new_df.write
    .format("delta")
    .mode("append")
    .partitionBy("year", "month")
    .saveAsTable("prod.sales.orders"))

# Get DeltaTable handle for DML
dt = DeltaTable.forName(spark, "prod.sales.orders")`
  },

  "delta lake::update, delete, upsert (merge)": {
    summary: "Delta Lake's DML API provides <code>update()</code>, <code>delete()</code>, and <code>merge()</code> as first-class operations. <code>merge()</code> (UPSERT) is the most powerful — it atomically compares a source DataFrame against the target table and applies matched/not-matched conditions. All operations write new Parquet files and record the change in the transaction log; old files are retained for time travel until <code>VACUUM</code> runs.",
    when_to_use: "Use <code>merge()</code> for CDC (Change Data Capture) pipelines where you receive updates and inserts together. Use <code>delete()</code> for GDPR right-to-erasure workflows. Use <code>update()</code> for simple field corrections. These operations are much safer than overwriting entire partitions.",
    gotchas: [
      "Delta merge requires two passes over source data — if your source uses non-deterministic functions like <code>current_timestamp()</code>, cache the source DataFrame first to ensure consistency",
      "<code>whenMatchedUpdateAll()</code> / <code>whenNotMatchedInsertAll()</code> require that source and target schemas match exactly — use explicit column mappings for schema differences"
    ],
    example: `from delta.tables import DeltaTable
from pyspark.sql import functions as F

dt = DeltaTable.forName(spark, "prod.sales.customers")

# UPSERT: update existing customers, insert new ones
(dt.alias("target")
   .merge(
       updates_df.alias("source"),
       "target.customer_id = source.customer_id"
   )
   .whenMatchedUpdate(set={
       "email":      "source.email",
       "updated_at": "source.updated_at",
       "ltv":        "target.ltv + source.new_revenue",
   })
   .whenNotMatchedInsert(values={
       "customer_id": "source.customer_id",
       "email":       "source.email",
       "created_at":  "source.created_at",
       "ltv":         "source.new_revenue",
   })
   .execute()
)

# Delete (GDPR erasure)
dt.delete(F.col("opt_out") == True)

# Conditional update
dt.update(
    condition=F.col("status") == "trial",
    set={"status": F.lit("expired")}
)`
  },

  "delta lake::time travel": {
    summary: "Delta Lake retains all previous versions of a table in the transaction log and underlying Parquet files. You can query any past version by version number or timestamp. <code>RESTORE TABLE</code> rolls the table back to a previous state. History is queryable via <code>DeltaTable.history()</code> or <code>DESCRIBE HISTORY</code>.",
    when_to_use: "Use time travel to audit data changes, recover from accidental deletes/overwrites, reproduce past reports, and compare data between pipeline runs. Version numbers are stable; timestamps are approximations — prefer version numbers for reproducibility.",
    gotchas: [
      "Time travel only works within the retention period — once <code>VACUUM</code> runs, old files are deleted and older versions become inaccessible. Default retention is 7 days (168 hours)",
      "Querying old versions can be slow if many files have been compacted since — the file list in old transaction log entries may reference many small files"
    ],
    example: `# Query version 3 of the table
df_v3 = (spark.read
    .format("delta")
    .option("versionAsOf", 3)
    .table("prod.sales.orders"))

# Query table as it was on a specific date
df_jan = (spark.read
    .format("delta")
    .option("timestampAsOf", "2024-01-31 23:59:59")
    .table("prod.sales.orders"))

# Compare current vs previous version
current  = spark.read.table("prod.sales.orders")
previous = spark.read.format("delta").option("versionAsOf", 5).table("prod.sales.orders")
new_rows = current.subtract(previous)

# View full history (operation, user, timestamp, metrics)
from delta.tables import DeltaTable
dt = DeltaTable.forName(spark, "prod.sales.orders")
display(dt.history())

# Restore to version 10 (SQL)
spark.sql("RESTORE TABLE prod.sales.orders VERSION AS OF 10")`
  },

  "delta lake::maintenance & optimization": {
    summary: "<code>OPTIMIZE</code> compacts small Parquet files into larger ones (default target ~1GB). <code>ZORDER BY</code> co-locates data with similar values in the same files, enabling data skipping for filtered queries — up to 100× speedup on large tables. <code>VACUUM</code> deletes Parquet files no longer referenced by the transaction log, reclaiming storage. Retention defaults to 7 days.",
    when_to_use: "Run <code>OPTIMIZE ZORDER BY</code> after large appends and on a schedule for tables that are queried frequently with filters on specific columns. Run <code>VACUUM</code> weekly or after large overwrites to reclaim storage. Z-order on columns you filter on most — typically date, customer_id, or region.",
    gotchas: [
      "Never run <code>VACUUM</code> with retention < 7 days (168 hours) if concurrent readers exist — they may be referencing files being deleted, causing read failures",
      "Z-ordering is only effective on columns with reasonable cardinality and that appear in <code>WHERE</code> filters — don't Z-order boolean or very low-cardinality columns"
    ],
    example: `# Compact files and Z-order for fast customer lookups
spark.sql("""
    OPTIMIZE prod.sales.orders
    ZORDER BY (customer_id, order_date)
""")

# Clean up old files (safe default: 7+ days)
spark.sql("VACUUM prod.sales.orders RETAIN 168 HOURS")

# Python API equivalent
from delta.tables import DeltaTable
dt = DeltaTable.forName(spark, "prod.sales.orders")
dt.vacuum(168)   # 168 hours = 7 days

# Table health check
spark.sql("DESCRIBE DETAIL prod.sales.orders").select(
    "numFiles", "sizeInBytes", "partitionColumns").show()

# Auto-optimize for streaming/incremental tables
spark.sql("""
    ALTER TABLE prod.sales.orders SET TBLPROPERTIES (
        'delta.autoOptimize.optimizeWrite' = 'true',
        'delta.autoOptimize.autoCompact'   = 'true'
    )
""")`
  },

  "delta lake::create delta table (ddl)": {
    summary: "Delta tables can be created with SQL DDL (<code>CREATE TABLE ... USING DELTA</code>), the DataFrame writer (<code>saveAsTable()</code>), or the <code>DeltaTableBuilder</code> API. Managed tables store data in the metastore's default location. External tables use a specified <code>LOCATION</code> and data persists if the table is dropped. <code>SHALLOW CLONE</code> creates a metadata-only copy; <code>DEEP CLONE</code> copies all data files.",
    when_to_use: "Use <code>CREATE TABLE ... LOCATION</code> for external tables where you want to manage data lifecycle independently of the metastore. Use <code>SHALLOW CLONE</code> for fast dev/test environments that need a copy of a production table's schema and history without the storage cost.",
    gotchas: [
      "Dropping a managed table deletes the underlying data permanently. Dropping an external table only removes the metadata — data files remain at the <code>LOCATION</code>",
      "<code>SHALLOW CLONE</code> references production data files — writes to the clone write new files, but reads fall back to the source files until data is changed"
    ],
    example: `# Create managed Delta table with schema + partitioning
spark.sql("""
    CREATE TABLE IF NOT EXISTS prod.sales.orders (
        order_id    BIGINT        NOT NULL,
        customer_id BIGINT        NOT NULL,
        order_date  DATE,
        status      STRING,
        revenue     DOUBLE,
        year        INT GENERATED ALWAYS AS (YEAR(order_date)),
        month       INT GENERATED ALWAYS AS (MONTH(order_date))
    )
    USING DELTA
    PARTITIONED BY (year, month)
    COMMENT 'Customer orders — partitioned by year/month'
""")

# External table pointing to existing Delta path
spark.sql("""
    CREATE TABLE IF NOT EXISTS prod.sales.orders_ext
    USING DELTA
    LOCATION 'abfss://container@account/delta/orders/'
""")

# Cheap clone for dev testing
spark.sql("""
    CREATE TABLE dev.sales.orders_clone
    SHALLOW CLONE prod.sales.orders
""")

# DeltaTableBuilder API (more Pythonic)
from delta.tables import DeltaTable
(DeltaTable.createIfNotExists(spark)
   .tableName("prod.sales.events")
   .addColumn("event_id",   "BIGINT",  nullable=False)
   .addColumn("event_type", "STRING")
   .addColumn("ts",         "TIMESTAMP")
   .partitionedBy("event_type")
   .execute())`
  },

  "delta lake::auto-optimize (table properties)": {
    summary: "Auto-optimize has two components: <code>optimizeWrite</code> coalesces small task outputs into larger files during writes (targeting 128MB+), reducing the small-files problem without a separate <code>OPTIMIZE</code> run. <code>autoCompact</code> triggers a lightweight <code>OPTIMIZE</code> after writes when the number of files in a partition exceeds a threshold.",
    when_to_use: "Enable <code>optimizeWrite</code> on tables that receive frequent small appends (streaming, incremental loads). Enable <code>autoCompact</code> on tables you read frequently and can tolerate a small write latency increase. Set these at the session level as defaults for all new tables in a pipeline.",
    gotchas: [
      "<code>autoCompact</code> runs synchronously as part of the write transaction and adds latency — disable it for latency-sensitive streaming sinks",
      "These settings persist in table properties and apply to all writers — communicate changes to other teams using the table"
    ],
    example: `# Enable per-table (persisted in Delta log)
spark.sql("""
    ALTER TABLE prod.sales.orders SET TBLPROPERTIES (
        'delta.autoOptimize.optimizeWrite' = 'true',
        'delta.autoOptimize.autoCompact'   = 'true'
    )
""")

# Enable as session default for all new tables
spark.conf.set(
    "spark.databricks.delta.properties.defaults.autoOptimize.optimizeWrite",
    "true")
spark.conf.set(
    "spark.databricks.delta.properties.defaults.autoOptimize.autoCompact",
    "true")

# For streaming: enable optimizeWrite only (autoCompact adds latency)
spark.sql("""
    ALTER TABLE prod.events.stream_sink SET TBLPROPERTIES (
        'delta.autoOptimize.optimizeWrite' = 'true',
        'delta.autoOptimize.autoCompact'   = 'false'
    )
""")`
  },

  // ── UNITY CATALOG ─────────────────────────────────────────────────────
  "unity catalog::three-level namespace": {
    summary: "Unity Catalog introduces a three-level namespace: <code>catalog.schema.table</code>. A <em>catalog</em> is the top-level container (e.g. <code>prod</code>, <code>dev</code>). A <em>schema</em> is a logical grouping within a catalog (formerly called 'database'). This replaces Hive Metastore's two-level <code>database.table</code>. Unity Catalog is the central governance layer for all Databricks data assets.",
    when_to_use: "Always use the fully-qualified three-part name in production pipelines to be explicit about which catalog/environment you're reading from or writing to. Use <code>USE CATALOG</code> / <code>USE SCHEMA</code> to set a default context in interactive notebooks.",
    gotchas: [
      "Hive Metastore tables use a two-part name (<code>db.table</code>) — migrating to Unity Catalog requires updating all references to three-part names",
      "<code>SHOW TABLES</code> without arguments shows tables in the current catalog/schema context — always specify the catalog/schema explicitly in production code"
    ],
    example: `# Fully-qualified reads and writes
df = spark.read.table("prod.sales.orders")
df.write.mode("overwrite").saveAsTable("dev.sales.orders_test")

# Set session context for interactive work
spark.sql("USE CATALOG prod")
spark.sql("USE SCHEMA sales")
# Now can use short names in this session
df = spark.read.table("orders")

# Cross-catalog join (Unity Catalog makes this seamless)
result = spark.sql("""
    SELECT o.order_id, c.email, p.name AS product
    FROM prod.sales.orders    o
    JOIN prod.customers.users c USING (customer_id)
    JOIN prod.catalog.products p USING (product_id)
    WHERE o.order_date = CURRENT_DATE
""")

spark.sql("SHOW TABLES IN prod.sales").show()`
  },

  "unity catalog::volumes (non-tabular files)": {
    summary: "Unity Catalog Volumes are the governed storage layer for non-tabular files (CSV, JSON, images, models, config files) within the Unity Catalog namespace. They use the path format <code>/Volumes/catalog/schema/volume/</code>. Volumes provide the same access control (GRANT/REVOKE) as tables, replacing raw DBFS mounts for new data.",
    when_to_use: "Use Volumes for all new non-tabular file storage in Databricks — raw ingestion landing zones, ML model artifacts, configuration files, and reference data. Volumes provide auditability and row-level access control that raw DBFS mounts lack.",
    gotchas: [
      "Volume paths (<code>/Volumes/...</code>) work with <code>spark.read</code>, <code>dbutils.fs</code>, and Python's <code>open()</code> — the path is mounted transparently on the driver",
      "DBFS mounts (<code>/mnt/...</code>) are legacy — they bypass Unity Catalog governance. Migrate to Volumes for all new data assets"
    ],
    example: `# Read a CSV from a Volume (full path)
df = spark.read.csv(
    "/Volumes/prod/raw_ingestion/uploads/customers_20240101.csv",
    header=True, inferSchema=False, schema=customer_schema)

# Write model artifacts to a Volume
import mlflow
mlflow.set_tracking_uri("databricks")
with mlflow.start_run():
    # ... train model ...
    mlflow.sklearn.log_model(model,
        artifact_path="/Volumes/prod/ml_models/churn/v3/")

# List files using dbutils
for f in dbutils.fs.ls("/Volumes/prod/raw_ingestion/uploads/"):
    print(f.name, f.size)

# Python file I/O also works on Volume paths
with open("/Volumes/prod/config/pipeline_config.json") as f:
    config = json.load(f)`
  },

  "unity catalog::grants & access control": {
    summary: "Unity Catalog uses SQL GRANT/REVOKE statements for fine-grained access control on catalogs, schemas, tables, views, and volumes. Privileges include <code>SELECT</code>, <code>MODIFY</code>, <code>ALL PRIVILEGES</code>, <code>CREATE TABLE</code>, <code>USE CATALOG</code>, <code>USE SCHEMA</code>. Grants can target users, service principals, or groups.",
    when_to_use: "Grant <code>SELECT</code> on tables to analyst groups. Grant <code>MODIFY</code> to ETL service principals. Grant <code>USE CATALOG</code> and <code>USE SCHEMA</code> alongside any table-level grant — without them, users cannot navigate to the table even if they have SELECT on it.",
    gotchas: [
      "A user needs <code>USE CATALOG</code> AND <code>USE SCHEMA</code> in addition to table-level privileges — table-only grants without namespace privileges silently fail",
      "Granting on a schema does not automatically grant on existing tables within it — use <code>GRANT ... ON ALL TABLES IN SCHEMA</code> to cover existing tables"
    ],
    example: `-- Grant read access to analysts group
GRANT USE CATALOG ON CATALOG prod TO \`data-analysts\`;
GRANT USE SCHEMA  ON SCHEMA prod.sales TO \`data-analysts\`;
GRANT SELECT      ON TABLE prod.sales.orders TO \`data-analysts\`;

-- Grant write access to ETL service principal
GRANT MODIFY ON TABLE prod.sales.orders
    TO \`etl-service-principal\`;

-- Grant on all tables in a schema (existing tables)
GRANT SELECT ON ALL TABLES IN SCHEMA prod.sales
    TO \`data-analysts\`;

-- Revoke access
REVOKE SELECT ON TABLE prod.sales.pii_data FROM \`data-analysts\`;

-- Audit who has access
SHOW GRANTS ON TABLE prod.sales.orders;
SHOW GRANTS ON SCHEMA prod.sales;`
  },

  // ── PATHS ─────────────────────────────────────────────────────────────
  "databricks-specific i/o paths::path prefixes": {
    summary: "Databricks uses several path namespaces: <code>dbfs:/</code> for the legacy Databricks File System, <code>/Volumes/</code> for Unity Catalog Volumes, and native cloud storage URIs (<code>s3://</code>, <code>abfss://</code>, <code>gs://</code>). The <code>file:/</code> prefix accesses the local driver node filesystem (not distributed). All Spark APIs and <code>dbutils.fs</code> understand all these schemes.",
    when_to_use: "Use <code>/Volumes/</code> for all new data in Databricks. Use native cloud URIs (<code>s3://</code>, <code>abfss://</code>) for cross-platform pipelines or when accessing data outside Databricks. Use <code>file:/</code> only for driver-local temp files.",
    gotchas: [
      "<code>dbfs:/</code> paths are accessible from all nodes; <code>file:/</code> paths are driver-only — reading a <code>file:/</code> path with <code>spark.read</code> will fail on executors",
      "Azure ADLS Gen2 uses <code>abfss://</code> (note the double <code>s</code>) — using the older <code>wasbs://</code> scheme works but bypasses AAD-based auth"
    ],
    example: `# Unity Catalog Volume (recommended for new data)
df = spark.read.parquet("/Volumes/prod/processed/events/")

# Native S3 (with instance profile or IAM role auth)
df = spark.read.parquet("s3://my-company-bucket/data/events/")

# Azure ADLS Gen2 (with service principal auth)
spark.conf.set(
    "fs.azure.account.oauth2.client.id.myaccount.dfs.core.windows.net",
    dbutils.secrets.get("scope", "sp-client-id"))
df = spark.read.parquet(
    "abfss://container@myaccount.dfs.core.windows.net/data/")

# GCS
df = spark.read.parquet("gs://my-gcs-bucket/data/events/")

# Legacy DBFS (avoid for new data)
df = spark.read.csv("dbfs:/FileStore/tables/legacy_data.csv")

# Driver-local file (read with Python, then createDataFrame)
with open("/tmp/config.json") as f:
    config = json.load(f)`
  },

  "databricks-specific i/o paths::spark.sql passthrough patterns": {
    summary: "In Databricks, <code>spark.sql()</code> is heavily used alongside the DataFrame API — many Databricks-specific operations (Unity Catalog DDL, Delta maintenance, OPTIMIZE, VACUUM, RESTORE) are only available as SQL. Python f-strings allow injecting runtime variables into SQL strings. Results are always returned as a DataFrame.",
    when_to_use: "Use <code>spark.sql()</code> for Delta maintenance commands (<code>OPTIMIZE</code>, <code>VACUUM</code>, <code>RESTORE</code>) that have no Python API equivalent. Use f-strings carefully — they're convenient but vulnerable to SQL injection if values come from untrusted input.",
    gotchas: [
      "F-string SQL injection: never use untrusted user input in f-string SQL. Use parameterised queries or validate/escape input first",
      "<code>spark.sql()</code> results are lazy — for DDL/DML operations call <code>.collect()</code> or cast to void to force execution; they don't always trigger automatically"
    ],
    example: `# Parameterised pipeline using Python variables
catalog    = "prod"
schema     = "sales"
table      = "orders"
start_date = "2024-01-01"
end_date   = "2024-03-31"

# Read filtered data
df = spark.sql(f"""
    SELECT *
    FROM {catalog}.{schema}.{table}
    WHERE order_date BETWEEN '{start_date}' AND '{end_date}'
      AND status != 'cancelled'
""")

# Delta maintenance (no DataFrame API equivalent)
spark.sql(f"OPTIMIZE {catalog}.{schema}.{table} ZORDER BY (customer_id)")
spark.sql(f"VACUUM {catalog}.{schema}.{table} RETAIN 168 HOURS")

# Dynamic table creation
spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {catalog}.{schema}.{table}_backup
    DEEP CLONE {catalog}.{schema}.{table}
""")

# DDL helpers
spark.sql(f"DROP TABLE IF EXISTS dev.{schema}.{table}_temp")
spark.sql(f"TRUNCATE TABLE dev.{schema}.{table}_staging")`
  },

};
