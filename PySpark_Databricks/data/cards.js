// Pre-generated card detail data sourced from:
// - https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/
// - https://docs.delta.io/latest/
// - https://docs.databricks.com/en/dev-tools/databricks-utils.html

const CARD_DATA = {

  // ── IMPORTS ────────────────────────────────────────────────────────────
  "imports::core": {
    summary: "The three essential imports for every PySpark job. §c§SparkSession§/c§ is the entry point to Spark SQL. §c§functions as F§/c§ gives access to all built-in column functions. §c§Window§/c§ enables window (analytic) functions. The §c§types§/c§ wildcard pulls in all schema types.",
    when_to_use: "Put these at the top of every PySpark script or notebook. Import §c§F§/c§ aliased so all function calls are clearly namespaced as §c§F.col()§/c§, §c§F.sum()§/c§, etc., avoiding ambiguity with Python builtins.",
    gotchas: [
      "Never do §c§from pyspark.sql.functions import *§/c§ — it shadows Python builtins like §c§sum§/c§, §c§min§/c§, §c§max§/c§, §c§round§/c§",
      "Always alias as §c§F§/c§: using bare function names makes it unclear whether you're calling a PySpark or Python function"
    ],
    example: `from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql import Window
from pyspark.sql.types import *

# All built-in functions are now accessed as F.*
df.select(F.col("name"), F.upper(F.col("city")))`
  },

  "imports::common types": {
    summary: "PySpark's type system maps directly to Spark SQL types and is used when defining explicit schemas or declaring UDF return types. §c§StructType§/c§ defines a row schema, §c§StructField§/c§ defines each column, and the primitive types (§c§StringType§/c§, §c§IntegerType§/c§, etc.) map to their SQL equivalents.",
    when_to_use: "Use explicit types when reading CSV/JSON with §c§inferSchema=False§/c§ for performance, when defining UDF return types, or when building schemas programmatically to avoid schema inference surprises in production pipelines.",
    gotchas: [
      "§c§IntegerType()§/c§ is 32-bit — use §c§LongType()§/c§ for large IDs or Unix timestamps to avoid overflow",
      "Type instances require parentheses: §c§StringType()§/c§ not §c§StringType§/c§"
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
    summary: "§c§pyspark.ml§/c§ is Spark's DataFrame-based ML library (successor to §c§mllib§/c§). §c§Pipeline§/c§ chains transformers and estimators. §c§VectorAssembler§/c§ combines feature columns into a single vector column required by ML algorithms. §c§StreamingContext§/c§ is the entry point for legacy DStream-based streaming (prefer Structured Streaming for new work).",
    when_to_use: "Use §c§Pipeline§/c§ whenever you have more than one preprocessing step to ensure fit/transform consistency between training and inference. Use §c§VectorAssembler§/c§ as the final step before any ML estimator.",
    gotchas: [
      "ML pipelines must be fit on training data only — never the full dataset — to avoid data leakage",
      "§c§StreamingContext§/c§ is the legacy DStream API; for new projects use §c§spark.readStream§/c§ (Structured Streaming)"
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
    summary: "§c§SparkSession§/c§ is the unified entry point for Spark SQL, DataFrame, and Dataset APIs, introduced in Spark 2.0 to replace §c§SQLContext§/c§ and §c§HiveContext§/c§. §c§getOrCreate()§/c§ returns an existing session if one is active, making it safe to call multiple times in the same process.",
    when_to_use: "Use §c§getOrCreate()§/c§ in scripts and libraries so they work both standalone and inside an existing session (e.g. Databricks notebooks where §c§spark§/c§ is pre-initialised). In Databricks, never create a new session — just use the pre-existing §c§spark§/c§ variable.",
    gotchas: [
      "In Databricks, §c§spark§/c§ is pre-initialised — calling §c§SparkSession.builder...getOrCreate()§/c§ returns it; no new session is created",
      "§c§local[*]§/c§ uses all available CPU cores for local mode; for cluster mode remove the §c§.master()§/c§ call entirely"
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
    summary: "§c§spark.conf.set/get§/c§ allows runtime configuration changes without restarting the session. Key configs include §c§spark.sql.shuffle.partitions§/c§ (default 200, often too high for small datasets), §c§spark.sql.adaptive.enabled§/c§ (AQE — on by default since Spark 3.2, auto-tunes partitions at runtime), and §c§spark.sql.autoBroadcastJoinThreshold§/c§. Since Spark 4.0, §c§spark.sql.ansi.enabled§/c§ defaults to §c§true§/c§ — invalid casts and numeric overflow now raise errors instead of returning NULL.",
    when_to_use: "Tune §c§shuffle.partitions§/c§ to 2–3× the number of cores for your cluster. Reduce it for small datasets to avoid task overhead. Set it to §c§-1§/c§ with AQE enabled to let Spark decide automatically.",
    gotchas: [
      "Some configs (like §c§spark.executor.memory§/c§) cannot be changed at runtime — they must be set before session creation",
      "AQE (§c§spark.sql.adaptive.enabled§/c§) is enabled by default since Spark 3.2 — don't disable it without a good reason",
  "Spark 4.0 turns on ANSI mode by default: set §c§spark.sql.ansi.enabled=false§/c§ only as a temporary migration escape hatch, not a permanent setting"
    ],
    example: `# Tune for a medium-sized cluster
spark.conf.set("spark.sql.shuffle.partitions", "64")
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")

# Spark 4.0: ANSI mode is ON by default (strict casts, overflow errors)
print(spark.conf.get("spark.sql.ansi.enabled"))  # "true" on Spark 4.0+

# Read back to confirm
print(spark.conf.get("spark.sql.shuffle.partitions"))

# Stop the session cleanly when done (standalone scripts only)
spark.stop()`
  },

  // ── CREATING DATAFRAMES ───────────────────────────────────────────────
  "creating dataframes::from data": {
    summary: "§c§spark.createDataFrame()§/c§ creates a DataFrame from local Python data structures. It accepts lists of tuples, lists of dicts, Pandas DataFrames, and RDDs. When passing tuples, provide a §c§schema§/c§ list or §c§StructType§/c§. When passing dicts, column names are inferred from keys.",
    when_to_use: "Use for unit testing, small lookup tables, or quick exploration. For any serious data volume, read from a file or table instead — §c§createDataFrame§/c§ collects data on the driver before distributing it.",
    gotchas: [
      "All data passes through the driver node first — never use this for large datasets",
      "When converting from Pandas, be aware of type mapping: Pandas §c§object§/c§ becomes §c§StringType§/c§, §c§int64§/c§ becomes §c§LongType§/c§"
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
    summary: "§c§spark.read§/c§ is a §c§DataFrameReader§/c§ that loads data from external storage. Supported formats include CSV, JSON (newline-delimited), Parquet, ORC, Avro, and text. Parquet is the recommended format for analytics — it is columnar, compressed, and stores schema. §c§inferSchema=True§/c§ on CSV triggers a full scan to determine types.",
    when_to_use: "Prefer Parquet or Delta for all internal data. Use CSV/JSON only for ingesting raw external data. Always provide an explicit schema in production to avoid inferSchema scans and schema drift.",
    gotchas: [
      "§c§inferSchema=True§/c§ on CSV reads the entire file twice — use explicit schema in production",
      "JSON reader expects newline-delimited JSON (NDJSON), not a JSON array — a single §c§[...]§/c§ file will fail"
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
    summary: "§c§StructType§/c§ defines the schema of a DataFrame as an ordered list of §c§StructField§/c§ objects. Each field has a name, data type, and nullability flag. Schemas can be nested — a §c§StructField§/c§ can itself contain a §c§StructType§/c§, §c§ArrayType§/c§, or §c§MapType§/c§.",
    when_to_use: "Define explicit schemas for all production CSV/JSON ingestion, UDF return types, and §c§createDataFrame§/c§ calls. This prevents inferSchema scans, protects against upstream schema changes, and makes pipeline intent explicit.",
    gotchas: [
      "§c§nullable=False§/c§ is not enforced at runtime — Spark will not throw an error if nulls appear; use it as documentation",
      "Column name matching during reads is case-insensitive by default — set §c§spark.sql.caseSensitive=true§/c§ if you need strict matching"
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
    summary: "§c§show()§/c§ prints a formatted table to stdout (truncating long values by default). §c§printSchema()§/c§ prints the tree-structured schema with types and nullability. §c§describe()§/c§ computes count, mean, stddev, min, max for numeric columns — similar to Pandas §c§describe()§/c§. §c§summary()§/c§ adds percentiles.",
    when_to_use: "Use §c§printSchema()§/c§ immediately after reading any new dataset to verify types. Use §c§describe()§/c§/§c§summary()§/c§ for quick data quality checks. In Databricks prefer §c§display(df)§/c§ over §c§show()§/c§ for richer output.",
    gotchas: [
      "§c§count()§/c§ triggers a full scan — avoid calling it repeatedly; cache the DataFrame first if you need multiple actions",
      "§c§show()§/c§ truncates strings at 20 characters by default — use §c§show(truncate=False)§/c§ or §c§show(truncate=50)§/c§"
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
    summary: "§c§select()§/c§ projects a subset of columns (equivalent to SQL §c§SELECT§/c§). §c§filter()§/c§ and §c§where()§/c§ are aliases for row filtering (equivalent to SQL §c§WHERE§/c§). Both accept column expressions or SQL strings. Multiple conditions use §c§&§/c§ (AND), §c§|§/c§ (OR), §c§~§/c§ (NOT) — not Python §c§and/or/not§/c§.",
    when_to_use: "Always select only the columns you need early in a pipeline — Parquet's columnar format means unneeded columns are never read. Use §c§F.col()§/c§ over §c§df.colname§/c§ to avoid ambiguity after joins where both DataFrames share a column name.",
    gotchas: [
      "Boolean conditions must be wrapped in parentheses: §c§(F.col('a') > 1) & (F.col('b') < 5)§/c§ — missing parens cause Python operator precedence bugs",
      "Using Python §c§and§/c§/§c§or§/c§ instead of §c§&§/c§/§c§|§/c§ raises a §c§ValueError§/c§ — Spark columns cannot be evaluated as Python booleans"
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
    summary: "§c§withColumn()§/c§ adds a new column or replaces an existing one with an expression — it returns a new DataFrame (DataFrames are immutable). §c§withColumnRenamed()§/c§ renames a single column. §c§drop()§/c§ removes one or more columns. §c§cast()§/c§ changes a column's data type.",
    when_to_use: "Chain multiple §c§withColumn()§/c§ calls for readability, but be aware that each call creates a new query plan node. For adding many columns at once (10+), prefer a single §c§select()§/c§ with all expressions to avoid plan bloat.",
    gotchas: [
      "Chaining 50+ §c§withColumn()§/c§ calls can cause query plan analysis to slow significantly — batch them into a single §c§select()§/c§",
      "If a column name passed to §c§withColumn()§/c§ already exists, the column is silently replaced — no error is raised"
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
    summary: "PySpark's string functions mirror SQL string functions and operate element-wise on column values. They return a new §c§Column§/c§ expression. Key functions: §c§upper/lower§/c§ for case conversion, §c§trim§/c§ variants for whitespace, §c§split§/c§ returns an §c§ArrayType§/c§, §c§regexp_replace/extract§/c§ for regex operations.",
    when_to_use: "Use these in §c§withColumn()§/c§ or §c§select()§/c§ for data cleaning and normalisation. §c§regexp_replace§/c§ is ideal for masking PII. §c§split§/c§ followed by §c§explode§/c§ is the standard pattern to unnest delimited fields.",
    gotchas: [
      "§c§split()§/c§ returns an §c§ArrayType§/c§ column — access elements with §c§F.col('arr')[0]§/c§ or use §c§explode()§/c§",
      "§c§regexp_extract()§/c§ returns an empty string (not null) when no match is found — check with §c§F.when(F.col('x') == '', None)§/c§"
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
    summary: "PySpark's date/time functions work on §c§DateType§/c§ and §c§TimestampType§/c§ columns. §c§to_date()§/c§ and §c§to_timestamp()§/c§ parse strings using Java's §c§SimpleDateFormat§/c§ or ISO patterns. §c§datediff()§/c§ returns integer days. §c§date_format()§/c§ formats to any pattern string.",
    when_to_use: "Use §c§to_date()§/c§/§c§to_timestamp()§/c§ immediately on ingestion to ensure correct typing. Use §c§year()§/c§/§c§month()§/c§/§c§dayofmonth()§/c§ for partitioning and time-based aggregations.",
    gotchas: [
      "Format strings use Java patterns, not Python's §c§strftime§/c§: §c§yyyy-MM-dd§/c§ not §c§%Y-%m-%d§/c§",
      "§c§current_timestamp()§/c§ returns the driver timestamp at plan creation time, not at executor execution time — use with care in distributed contexts"
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
    summary: "§c§F.when(condition, value).otherwise(value)§/c§ is PySpark's vectorised if/else — equivalent to SQL §c§CASE WHEN§/c§. §c§F.coalesce()§/c§ returns the first non-null value across columns. §c§F.lit()§/c§ creates a literal constant column. Math functions (§c§round§/c§, §c§abs§/c§, §c§pow§/c§) operate element-wise.",
    when_to_use: "Use §c§when().otherwise()§/c§ for all conditional column logic — never use Python §c§if§/c§ in a DataFrame context. Chain multiple §c§.when()§/c§ calls for multi-branch conditions. Use §c§coalesce()§/c§ for null-safe fallback logic across columns.",
    gotchas: [
      "Omitting §c§.otherwise()§/c§ from a §c§when()§/c§ chain returns §c§null§/c§ for unmatched rows — always be explicit",
      "§c§F.round()§/c§ uses banker's rounding (round half to even) by default — if you need standard rounding, use §c§F.bround()§/c§"
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
    summary: "Aggregate functions reduce a group of rows to a single value. They are used inside §c§groupBy().agg()§/c§ or as window functions with §c§.over()§/c§. §c§collect_list()§/c§ returns all values as an array (preserving duplicates); §c§collect_set()§/c§ returns unique values. §c§approx_count_distinct()§/c§ uses HyperLogLog for scalable cardinality estimation.",
    when_to_use: "Use §c§approx_count_distinct()§/c§ instead of §c§countDistinct()§/c§ on large datasets — it's O(1) memory vs O(n) and typically within 5% accuracy. Use §c§collect_list()§/c§ to pivot row values into arrays within a group.",
    gotchas: [
      "§c§collect_list()§/c§ and §c§collect_set()§/c§ collect all data for a group onto a single executor — can cause OOM on high-cardinality groups",
      "§c§count('*')§/c§ counts all rows including nulls; §c§count('col')§/c§ counts only non-null values in that column"
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
    summary: "§c§explode()§/c§ transforms one row with an array into multiple rows (one per element) — the inverse of §c§collect_list()§/c§. §c§explode_outer()§/c§ preserves rows with null/empty arrays (returning null). §c§posexplode()§/c§ also returns the element's index. §c§array_contains()§/c§ and §c§size()§/c§ work on array columns.",
    when_to_use: "Use §c§explode()§/c§ to unnest nested data (e.g. JSON arrays, collected lists). Use §c§explode_outer()§/c§ in ETL pipelines where you cannot afford to silently drop rows with empty arrays.",
    gotchas: [
      "§c§explode()§/c§ silently drops rows where the array is null or empty — use §c§explode_outer()§/c§ if you need to preserve them",
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
    summary: "UDFs (User Defined Functions) allow arbitrary Python logic as a column transformation. Regular UDFs are slow — they serialise each row to Python, apply the function, and serialise back. Pandas UDFs (vectorised) operate on §c§pd.Series§/c§ batches using Apache Arrow, delivering 10–100× better performance. Spark 3.5+ also offers Arrow-optimized regular UDFs via §c§useArrow=True§/c§, and Spark 4.0 adds polymorphic Python UDTFs (table-valued functions) for multi-row output.",
    when_to_use: "Always prefer built-in Spark functions over UDFs. When a UDF is unavoidable, always use a Pandas UDF. Reserve regular Python UDFs only for functions that cannot be expressed as pandas operations.",
    gotchas: [
      "Regular UDFs disable Catalyst optimisations — the optimiser treats them as black boxes and cannot push filters past them",
      "Pandas UDFs require §c§pyarrow§/c§ to be installed on all cluster nodes — verify this in Databricks cluster libraries",
      "UDFs cannot access Spark internals (no SparkContext, no reading other DataFrames) — they are pure row-level transformations",
  "On Spark 4.0 with ANSI mode, a UDF that returns a type mismatch (e.g. str where double declared) raises an error rather than silently coercing"
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
    calculate_score(F.col("amount"), F.col("days_active")))

# Spark 3.5+: Arrow-optimized regular UDF (faster serialisation)
@F.udf(StringType(), useArrow=True)
def fast_udf(val):
    return val.strip().upper() if val else None`
  },

  // ── GROUPBY ───────────────────────────────────────────────────────────
  "groupby & aggregations::groupby": {
    summary: "§c§groupBy()§/c§ groups rows by one or more column values and returns a §c§GroupedData§/c§ object. Call §c§.agg()§/c§ on it with named aggregate expressions, or call shorthand methods like §c§.count()§/c§, §c§.sum()§/c§, §c§.mean()§/c§. §c§.pivot()§/c§ rotates distinct values of a column into new columns (like Excel pivot tables).",
    when_to_use: "Use §c§.agg()§/c§ with §c§.alias()§/c§ for readable output column names. Use §c§.pivot()§/c§ to reshape narrow data into wide format for reporting — but specify the pivot values explicitly to avoid a full scan for distinct values.",
    gotchas: [
      "§c§pivot()§/c§ without explicit values triggers a full scan to find distinct values — always pass them explicitly: §c§.pivot('month', ['Jan','Feb','Mar'])§/c§",
      "After §c§groupBy().agg()§/c§, grouped columns appear first — the output schema may differ from input"
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
    summary: "Window functions compute a value for each row based on a group of related rows (the 'window') without collapsing rows like §c§groupBy()§/c§. The §c§Window§/c§ spec defines the partition (like GROUP BY), ordering, and optional frame bounds. Common functions: §c§rank()§/c§, §c§dense_rank()§/c§, §c§row_number()§/c§, §c§lag()§/c§, §c§lead()§/c§, running totals.",
    when_to_use: "Use window functions to add rankings, running totals, or lagged values to each row while keeping all rows. The classic use case is 'top N per group' using §c§row_number()§/c§ filtered to §c§rn == 1§/c§.",
    gotchas: [
      "Window functions with large partitions (high-cardinality keys) can cause OOM — all rows in a partition must fit on one executor",
      "§c§rank()§/c§ leaves gaps after ties (1,1,3); §c§dense_rank()§/c§ does not (1,1,2); §c§row_number()§/c§ is always unique",
      "Omitting §c§partitionBy()§/c§ makes the whole DataFrame one partition — never do this on large data"
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
    summary: "PySpark supports all standard SQL join types. §c§left_semi§/c§ returns only left rows that have a match (like §c§WHERE EXISTS§/c§). §c§left_anti§/c§ returns only left rows with no match (like §c§WHERE NOT EXISTS§/c§). Broadcast joins avoid shuffling the large table by replicating the small table to every executor — critical for performance when joining a large table to a small lookup.",
    when_to_use: "Use §c§F.broadcast()§/c§ for any table under ~100MB (configurable via §c§spark.sql.autoBroadcastJoinThreshold§/c§). Spark will auto-broadcast below the threshold, but explicit broadcast hints override it. Use §c§left_semi§/c§ instead of inner join when you only need columns from the left table.",
    gotchas: [
      "After joining on column names (not expressions), the join key appears only once. After joining on expressions (§c§df1.id == df2.user_id§/c§), both columns appear — drop duplicates explicitly",
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
    summary: "§c§dropDuplicates()§/c§ removes duplicate rows based on all or a subset of columns. §c§dropna()§/c§ removes rows with null values, optionally in specific columns. §c§fillna()§/c§ replaces nulls with a constant or column-level defaults. §c§orderBy()§/c§/§c§sort()§/c§ are aliases — both trigger a full sort (expensive operation).",
    when_to_use: "Use §c§dropDuplicates(['id'])§/c§ to deduplicate by key rather than all columns. Use §c§fillna({'col': default})§/c§ to apply different defaults per column. Avoid sorting unless required for output — prefer §c§orderBy()§/c§ only at the final stage of a pipeline.",
    gotchas: [
      "§c§orderBy()§/c§/§c§sort()§/c§ collects all data into a single partition for sorting — use only when necessary and as the last transformation",
      "§c§dropDuplicates()§/c§ keeps an arbitrary row among duplicates — if you need the latest row, use §c§row_number()§/c§ window function instead"
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
    summary: "§c§union()§/c§ stacks two DataFrames by column position (both must have same number of columns). §c§unionByName()§/c§ matches by column name (safer, allows different column order). §c§intersect()§/c§ returns rows present in both. §c§subtract()§/c§ returns rows in the first DataFrame not in the second. All set operations return distinct rows except §c§unionAll()§/c§.",
    when_to_use: "Always prefer §c§unionByName()§/c§ over §c§union()§/c§ — positional matching silently produces wrong results if schemas differ. Use §c§unionByName(allowMissingColumns=True)§/c§ (Spark 3.1+) when schemas partially overlap.",
    gotchas: [
      "§c§union()§/c§ matches by position, not name — if column order differs between DataFrames, data will be silently mixed up",
      "Set operations like §c§intersect()§/c§ and §c§subtract()§/c§ perform a shuffle to find duplicates — they are expensive on large DataFrames"
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
    summary: "§c§createOrReplaceTempView()§/c§ registers a DataFrame as a temporary SQL table scoped to the current SparkSession. §c§createOrReplaceGlobalTempView()§/c§ registers it in the global §c§global_temp§/c§ database, visible across sessions on the same cluster. §c§spark.sql()§/c§ executes any SQL string and returns a DataFrame. Spark 3.5+ supports safe parameterized queries via the §c§args=§/c§ argument (named §c§:param§/c§ or positional §c§?§/c§ markers) — prefer this over f-strings to avoid SQL injection.",
    when_to_use: "Use temp views when you have complex multi-step SQL that's cleaner to write in SQL than DataFrame API, or when handing data off to SQL-oriented team members. Use §c§spark.sql()§/c§ for DDL operations (§c§CREATE TABLE§/c§, §c§OPTIMIZE§/c§, §c§VACUUM§/c§) that have no DataFrame API equivalent.",
    gotchas: [
      "Temp views are session-scoped — they disappear when the SparkSession ends or the notebook is detached",
      "Global temp views are accessed as §c§global_temp.view_name§/c§ in SQL — the schema prefix is required",
  "Avoid building SQL with Python f-strings on untrusted input — use the §c§args=§/c§ parameter (Spark 3.5+) instead to prevent injection"
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

# Parameterized query (Spark 3.5+) — safe, no injection risk
df = spark.sql(
    "SELECT * FROM orders WHERE order_date >= :start",
    args={"start": "2024-01-01"})`
  },

  "sql interface::catalog": {
    summary: "The §c§Catalog§/c§ API (§c§spark.catalog§/c§) provides programmatic access to database metadata — listing tables, columns, databases, and managing table caches. It wraps the Hive Metastore or Unity Catalog depending on your Spark environment. Useful for building dynamic pipelines that discover tables at runtime.",
    when_to_use: "Use §c§tableExists()§/c§ in idempotent pipelines before creating or dropping tables. Use §c§listTables()§/c§ / §c§listColumns()§/c§ in metadata-driven frameworks that process tables dynamically.",
    gotchas: [
      "In Databricks with Unity Catalog, use the three-part name §c§catalog.schema.table§/c§ — §c§listTables()§/c§ operates on the current database unless you specify one",
      "§c§spark.catalog.clearCache()§/c§ clears all cached tables — use §c§spark.catalog.uncacheTable('name')§/c§ to target a specific table"
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
    summary: "The §c§DataFrameWriter§/c§ API supports four save modes: §c§overwrite§/c§ (replace existing data), §c§append§/c§ (add rows), §c§ignore§/c§ (no-op if exists), §c§error§/c§/§c§errorIfExists§/c§ (default — raise error if exists). Parquet is the recommended format. §c§partitionBy()§/c§ writes data into directory partitions (Hive-style), enabling partition pruning on reads.",
    when_to_use: "Always partition large tables by high-cardinality date/region columns that are frequently used as filters. Partition by low-cardinality columns only — partitioning by user_id creates millions of tiny files. Use §c§overwrite§/c§ mode with §c§partitionOverwriteMode=dynamic§/c§ to replace only affected partitions.",
    gotchas: [
      "§c§mode('overwrite')§/c§ on a partitioned table with dynamic partition overwrite enabled replaces only the partitions present in the DataFrame — set §c§spark.conf.set('spark.sql.sources.partitionOverwriteMode', 'dynamic')§/c§",
      "Writing too many small files is a common performance killer — always §c§repartition()§/c§ or §c§coalesce()§/c§ to a reasonable number before writing"
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
    summary: "§c§saveAsTable()§/c§ writes data and registers it in the Spark/Hive Metastore as a managed table. §c§insertInto()§/c§ appends to an existing table by column position. JDBC write uses a JDBC driver to write to relational databases. The table format defaults to Parquet unless Delta is configured.",
    when_to_use: "Use §c§saveAsTable()§/c§ when you want the table to be queryable by name after the job. Use JDBC for pushing aggregated results back to a relational data warehouse (Postgres, MySQL, SQL Server) — not for large-scale writes due to JDBC throughput limits.",
    gotchas: [
      "§c§insertInto()§/c§ inserts by column position, not name — column order in the DataFrame must exactly match the table schema",
      "JDBC writes are single-threaded by default — set §c§numPartitions§/c§ and ensure the target table has no unique constraints that would cause conflicts on parallel writes"
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
    summary: "§c§cache()§/c§ stores a DataFrame in memory (deserialized JVM objects). §c§persist()§/c§ allows specifying the storage level: §c§MEMORY_ONLY§/c§, §c§MEMORY_AND_DISK§/c§ (default), §c§DISK_ONLY§/c§, etc. §c§repartition(n)§/c§ performs a full shuffle; §c§coalesce(n)§/c§ merges partitions without a shuffle (only reduces partition count).",
    when_to_use: "Cache a DataFrame when it's used in multiple downstream actions (e.g. both a count and a write). Repartition before a wide join or shuffle-heavy operation to control parallelism. Use §c§coalesce()§/c§ before writing to reduce small output files. On Databricks Delta tables, prefer liquid clustering (§c§CLUSTER BY§/c§) over manual repartitioning for data-skipping (see the Delta Lake section).",
    gotchas: [
      "Caching is lazy — the DataFrame is not actually cached until the first action. Call §c§df.cache().count()§/c§ to force materialisation",
      "§c§coalesce()§/c§ can only reduce partitions, not increase them — and the resulting partitions may be unequal in size, causing skew"
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
    summary: "§c§explain()§/c§ prints the query execution plan — from the unresolved logical plan through to the final physical plan. The physical plan shows what Spark actually executes: scan types, join strategies (BroadcastHashJoin, SortMergeJoin), exchange (shuffle) operations, and filter pushdowns. The Spark UI at port 4040 provides the full visual DAG, stage details, and task metrics.",
    when_to_use: "Run §c§explain('formatted')§/c§ when a job is slower than expected — look for missing filter pushdowns, unexpected SortMergeJoins (vs BroadcastHashJoins), and unnecessary shuffles (§c§Exchange§/c§ nodes). In Databricks, use the built-in query plan visualiser. Spark 4.0 also standardises error messages with error classes (e.g. §c§[DIVIDE_BY_ZERO]§/c§) that name the cause and suggest fixes.",
    gotchas: [
      "A plan with many consecutive §c§Project§/c§ nodes from chained §c§withColumn()§/c§ calls can slow plan analysis — batch into a single §c§select()§/c§",
      "§c§Exchange§/c§ in the physical plan means a shuffle — each shuffle writes to disk and sends data over the network, making it the most expensive operation"
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
    summary: "Databricks notebook magic commands are single-line directives prefixed with §c§%§/c§ that change the execution context for an entire cell. §c§%sql§/c§ runs the cell as Spark SQL. §c§%sh§/c§ runs shell commands on the driver node. §c§%md§/c§ renders Markdown. §c§%run§/c§ executes another notebook inline, sharing its variables and functions with the current notebook.",
    when_to_use: "Use §c§%sql§/c§ for DDL (§c§OPTIMIZE§/c§, §c§VACUUM§/c§, §c§CREATE TABLE§/c§) and ad-hoc SQL queries. Use §c§%sh§/c§ to install system packages, check disk usage, or debug driver-side file issues. Use §c§%run§/c§ to import shared utility notebooks (config, helper functions).",
    gotchas: [
      "§c§%sh§/c§ only runs on the driver — it does not execute on worker nodes. Use §c§sc.parallelize§/c§ with subprocess calls if you need to run shell commands on workers",
      "§c§%run§/c§ executes the target notebook in the current scope — all variables defined in the child notebook become available in the parent, which can cause naming collisions"
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
    summary: "§c§%pip install§/c§ installs Python packages into the notebook's Python environment on all cluster nodes via pip. It automatically restarts the Python interpreter after installation. §c§dbutils.library.restartPython()§/c§ explicitly restarts the Python interpreter, which is required after §c§%pip install§/c§ in some DBR versions to ensure the new package is importable.",
    when_to_use: "Use §c§%pip install§/c§ for per-notebook dependencies. For cluster-wide dependencies that all notebooks need, install libraries via the cluster Libraries tab or an init script instead — §c§%pip§/c§ adds per-run overhead and doesn't persist after cluster restart.",
    gotchas: [
      "§c§%pip install§/c§ restarts the Python process — any variables defined before the install cell are lost. Structure notebooks so all installs come before any computation",
      "Packages installed with §c§%pip§/c§ are not available in Scala or R cells — each language has its own environment"
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
    summary: "§c§display(df)§/c§ renders a DataFrame as an interactive table in Databricks notebooks with sorting, filtering, pagination, and built-in chart builder. It supports DataFrames, Pandas DataFrames, Matplotlib figures, Plotly charts, and images. §c§displayHTML()§/c§ renders arbitrary HTML/CSS/JS inline in the notebook output.",
    when_to_use: "Always use §c§display()§/c§ instead of §c§df.show()§/c§ in Databricks notebooks — it provides far richer output and doesn't truncate columns. Use §c§display()§/c§ after any aggregation to get instant charting without writing extra code.",
    gotchas: [
      "§c§display()§/c§ collects data to the driver — for very large DataFrames, always §c§.limit()§/c§ first to avoid OOM on the driver",
      "§c§display()§/c§ is Databricks-specific and not available in standalone PySpark — code using it will fail outside Databricks"
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
    when_to_use: "Use widgets when a notebook is run repeatedly with different parameters (e.g. a daily report notebook with a configurable date range). Use §c§dbutils.notebook.run(path, timeout, arguments)§/c§ to pass widget values programmatically when orchestrating from a parent notebook or Databricks Workflow.",
    gotchas: [
      "Widget values are always strings — cast them explicitly: §c§int(dbutils.widgets.get('year'))§/c§",
      "Widgets created with §c§dbutils.widgets.text()§/c§ in a re-run cell accumulate — call §c§dbutils.widgets.removeAll()§/c§ at the top of the notebook to prevent stale widgets"
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
    summary: "§c§dbutils.fs§/c§ provides a file system API for DBFS (Databricks File System), Unity Catalog Volumes, and cloud storage (S3, ADLS, GCS). It wraps underlying cloud storage APIs with a unified interface. DBFS paths use §c§dbfs:/§/c§ prefix; Volume paths use §c§/Volumes/§/c§. All paths within DBFS are also accessible at §c§/dbfs/§/c§ from driver-side Python file I/O.",
    when_to_use: "Use §c§dbutils.fs.ls()§/c§ to inspect data landing zones. Use §c§dbutils.fs.cp()§/c§/§c§mv()§/c§ to move files through pipeline stages. Use §c§dbutils.fs.rm(recurse=True)§/c§ to clean up temp outputs. Prefer Unity Catalog Volumes over raw DBFS for all new data.",
    gotchas: [
      "DBFS is a legacy abstraction — for new projects, use Unity Catalog Volumes (§c§/Volumes/catalog/schema/vol/§/c§) for proper governance and access control",
      "§c§dbutils.fs§/c§ operations are not atomic — a failed §c§cp§/c§ may leave a partial file. Always validate after copy with a size or checksum check"
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
    summary: "The Databricks Secrets API stores sensitive credentials (API keys, passwords, connection strings) in an encrypted vault backed by Azure Key Vault or Databricks' own secret store. §c§dbutils.secrets.get()§/c§ retrieves a secret by scope and key. Critically, secret values are automatically redacted from notebook output — printing a secret shows §c§[REDACTED]§/c§.",
    when_to_use: "Always retrieve credentials via §c§dbutils.secrets.get()§/c§ — never hardcode credentials in notebooks, scripts, or Repos. Use secrets in JDBC connection strings, Spark configs for cloud storage access keys, and API authentication headers.",
    gotchas: [
      "Secrets are redacted in output but are accessible in memory — don't pass them to functions that log their arguments",
      "§c§dbutils.secrets.get()§/c§ only works inside a Databricks notebook or job — it cannot be called from a local IDE or CI system without Databricks Connect"
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
    summary: "§c§dbutils.notebook.run()§/c§ executes another notebook as a sub-job synchronously, passing arguments as a dict and receiving a return value as a string. It can be used for modular notebook pipelines. §c§dbutils.notebook.exit()§/c§ terminates the current notebook and returns a value to the calling notebook or Workflow.",
    when_to_use: "Use §c§dbutils.notebook.run()§/c§ to build fan-out pipelines where a parent notebook triggers child notebooks in parallel (using Python §c§concurrent.futures§/c§). Prefer Databricks Workflows for production orchestration — notebook-level orchestration is harder to monitor and retry.",
    gotchas: [
      "§c§dbutils.notebook.run()§/c§ is synchronous and blocks — use §c§concurrent.futures.ThreadPoolExecutor§/c§ to run multiple child notebooks in parallel",
      "Return values from §c§exit()§/c§ are strings only — serialise complex results to JSON: §c§dbutils.notebook.exit(json.dumps(result_dict))§/c§"
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
    summary: "§c§dbutils.help()§/c§ and the module-level §c§.help()§/c§ methods print inline documentation for every command in that module, including parameter names and types. This is the fastest way to discover available commands without leaving the notebook.",
    when_to_use: "Run §c§dbutils.help()§/c§ whenever you're unsure what's available. Run §c§dbutils.fs.help()§/c§, §c§dbutils.secrets.help()§/c§ etc. for command-specific docs. §c§dbutils.library.restartPython()§/c§ is the correct way to restart the Python process after pip installs.",
    gotchas: [
      "§c§dbutils.library.restartPython()§/c§ resets all Python state — any DataFrames, variables, and imports defined before the restart are gone",
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
    summary: "Delta Lake is a storage layer built on Parquet that adds ACID transactions, schema enforcement, time travel, and audit history to data lakes. In Databricks, §c§delta§/c§ is the default format for all tables. Data is stored as Parquet files plus a §c§_delta_log/§/c§ directory containing JSON transaction logs. §c§DeltaTable.forName()§/c§ / §c§forPath()§/c§ creates a handle for DML operations.",
    when_to_use: "Use Delta for all tables in Databricks — it is the default and provides ACID guarantees, schema evolution, and time travel at no extra cost. Use §c§spark.read.table()§/c§ for Unity Catalog tables (3-part name), §c§forPath()§/c§ for path-based access.",
    gotchas: [
      "Delta tables created with §c§saveAsTable()§/c§ are managed by the metastore — dropping the table also deletes the data. Tables created with §c§save(path)§/c§ are external — dropping the table leaves data intact",
      "Schema enforcement is enabled by default — writing a DataFrame with extra or mismatched columns raises an §c§AnalysisException§/c§. Use §c§mergeSchema§/c§ or §c§overwriteSchema§/c§ options to evolve the schema"
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
    summary: "Delta Lake's DML API provides §c§update()§/c§, §c§delete()§/c§, and §c§merge()§/c§ as first-class operations. §c§merge()§/c§ (UPSERT) is the most powerful — it atomically compares a source DataFrame against the target table and applies matched/not-matched conditions. All operations write new Parquet files and record the change in the transaction log; old files are retained for time travel until §c§VACUUM§/c§ runs.",
    when_to_use: "Use §c§merge()§/c§ for CDC (Change Data Capture) where you receive updates and inserts together. Use §c§delete()§/c§ for GDPR right-to-erasure workflows. Use §c§update()§/c§ for simple field corrections. In Lakeflow Spark Declarative Pipelines, the §c§AUTO CDC§/c§ APIs (§c§create_auto_cdc_flow()§/c§, formerly §c§apply_changes()§/c§) automate SCD Type 1/2 without hand-writing merge logic.",
    gotchas: [
      "Delta merge requires two passes over source data — if your source uses non-deterministic functions like §c§current_timestamp()§/c§, cache the source DataFrame first to ensure consistency",
      "§c§whenMatchedUpdateAll()§/c§ / §c§whenNotMatchedInsertAll()§/c§ require that source and target schemas match exactly — use explicit column mappings for schema differences",
  "For declarative pipeline CDC, prefer §c§AUTO CDC§/c§ over a manual §c§merge()§/c§ — it handles ordering, SCD type, and out-of-order events for you"
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
    summary: "Delta Lake retains all previous versions of a table in the transaction log and underlying Parquet files. You can query any past version by version number or timestamp. §c§RESTORE TABLE§/c§ rolls the table back to a previous state. History is queryable via §c§DeltaTable.history()§/c§ or §c§DESCRIBE HISTORY§/c§.",
    when_to_use: "Use time travel to audit data changes, recover from accidental deletes/overwrites, reproduce past reports, and compare data between pipeline runs. Version numbers are stable; timestamps are approximations — prefer version numbers for reproducibility.",
    gotchas: [
      "Time travel only works within the retention period — once §c§VACUUM§/c§ runs, old files are deleted and older versions become inaccessible. Default retention is 7 days (168 hours)",
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
    summary: "§c§OPTIMIZE§/c§ compacts small Parquet files into larger ones (default target ~1GB). §c§ZORDER BY§/c§ co-locates data with similar values in the same files, enabling data skipping for filtered queries — up to 100× speedup on large tables. §c§VACUUM§/c§ deletes Parquet files no longer referenced by the transaction log, reclaiming storage (retention defaults to 7 days). On current Databricks, liquid clustering (§c§CLUSTER BY§/c§) is the recommended alternative to §c§ZORDER§/c§, and predictive optimization auto-runs §c§OPTIMIZE§/c§/§c§VACUUM§/c§ on Unity Catalog managed tables.",
    when_to_use: "For new tables, prefer liquid clustering (§c§CLUSTER BY§/c§) over §c§ZORDER§/c§ — it is incremental and needs no partitioning. For Unity Catalog managed tables, enable predictive optimization and let Databricks schedule §c§OPTIMIZE§/c§/§c§VACUUM§/c§ automatically. On legacy tables still using §c§ZORDER§/c§, run §c§OPTIMIZE ZORDER BY§/c§ after large appends; use §c§OPTIMIZE FULL§/c§ (DBR 16.0+) to fully recluster after changing clustering keys.",
    gotchas: [
      "Never run §c§VACUUM§/c§ with retention < 7 days (168 hours) if concurrent readers exist — they may be referencing files being deleted, causing read failures",
      "Z-ordering is only effective on columns with reasonable cardinality and that appear in §c§WHERE§/c§ filters — don't Z-order boolean or very low-cardinality columns",
  "Predictive optimization ignores Z-ordered files when it runs §c§OPTIMIZE§/c§ — migrate legacy tables to liquid clustering to benefit fully from automatic maintenance"
    ],
    example: `# Preferred (current): liquid clustering — incremental, no partitions
spark.sql("OPTIMIZE prod.sales.orders")   # clusters by table's CLUSTER BY keys

# Fully recluster after changing keys (DBR 16.0+)
spark.sql("OPTIMIZE prod.sales.orders FULL")

# Legacy tables still on Z-order:
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

# Best on Unity Catalog: let predictive optimization schedule
# OPTIMIZE + VACUUM automatically (no manual jobs needed)
spark.sql("ALTER TABLE prod.sales.orders ENABLE PREDICTIVE OPTIMIZATION")`
  },

  "delta lake::create delta table (ddl)": {
    summary: "Delta tables can be created with SQL DDL (§c§CREATE TABLE ... USING DELTA§/c§), the DataFrame writer (§c§saveAsTable()§/c§), or the §c§DeltaTableBuilder§/c§ API. Managed tables store data in the metastore's default location. External tables use a specified §c§LOCATION§/c§ and data persists if the table is dropped. Current Databricks recommends §c§CLUSTER BY (cols)§/c§ (liquid clustering) or §c§CLUSTER BY AUTO§/c§ instead of §c§PARTITIONED BY§/c§ for most tables. §c§SHALLOW CLONE§/c§ creates a metadata-only copy; §c§DEEP CLONE§/c§ copies all data files.",
    when_to_use: "Prefer §c§CLUSTER BY§/c§ over §c§PARTITIONED BY§/c§ unless you have a specific partitioning need (e.g. regulatory data separation). Use §c§CLUSTER BY AUTO§/c§ on Unity Catalog managed tables to let predictive optimization pick keys. Use §c§CREATE TABLE ... LOCATION§/c§ for external tables; use §c§SHALLOW CLONE§/c§ for cheap dev/test copies.",
    gotchas: [
      "Dropping a managed table deletes the underlying data permanently. Dropping an external table only removes the metadata — data files remain at the §c§LOCATION§/c§",
      "§c§SHALLOW CLONE§/c§ references production data files — writes to the clone write new files, but reads fall back to the source files until data is changed",
  "Liquid clustering and §c§PARTITIONED BY§/c§ are mutually exclusive — a table uses one or the other, not both. Max 4 clustering keys (2–3 is the useful maximum)"
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
    CLUSTER BY (order_date, customer_id)
    COMMENT 'Customer orders — liquid clustering (preferred)'
""")

# CLUSTER BY AUTO: let predictive optimization choose keys (UC managed)
spark.sql("""
    CREATE TABLE IF NOT EXISTS prod.sales.orders_auto (
        order_id BIGINT, customer_id BIGINT, order_date DATE
    ) USING DELTA CLUSTER BY AUTO
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
    summary: "Auto-optimize has two components: §c§optimizeWrite§/c§ coalesces small task outputs into larger files during writes (targeting 128MB+), reducing the small-files problem without a separate §c§OPTIMIZE§/c§ run. §c§autoCompact§/c§ triggers a lightweight §c§OPTIMIZE§/c§ after writes when the number of files in a partition exceeds a threshold. On Unity Catalog managed tables, predictive optimization now handles this automatically — manual auto-optimize properties are mainly for external tables or non-UC setups.",
    when_to_use: "On Unity Catalog managed tables, prefer enabling predictive optimization instead of setting these manually. For external or non-UC tables, enable §c§optimizeWrite§/c§ on tables with frequent small appends (streaming, incremental loads) and §c§autoCompact§/c§ on frequently-read tables that tolerate a small write-latency increase.",
    gotchas: [
      "§c§autoCompact§/c§ runs synchronously as part of the write transaction and adds latency — disable it for latency-sensitive streaming sinks",
      "These settings persist in table properties and apply to all writers — communicate changes to other teams using the table",
  "On UC managed tables these properties are largely superseded by predictive optimization; setting both is redundant"
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
    summary: "Unity Catalog introduces a three-level namespace: §c§catalog.schema.table§/c§. A <em>catalog</em> is the top-level container (e.g. §c§prod§/c§, §c§dev§/c§). A <em>schema</em> is a logical grouping within a catalog (formerly called 'database'). This replaces Hive Metastore's two-level §c§database.table§/c§. Unity Catalog is the central governance layer for all Databricks data assets and is the default for new workspaces; attribute-based access control (ABAC) with governed tags is a newer addition (preview).",
    when_to_use: "Always use the fully-qualified three-part name in production pipelines to be explicit about which catalog/environment you're reading from or writing to. Use §c§USE CATALOG§/c§ / §c§USE SCHEMA§/c§ to set a default context in interactive notebooks.",
    gotchas: [
      "Hive Metastore tables use a two-part name (§c§db.table§/c§) — migrating to Unity Catalog requires updating all references to three-part names",
      "§c§SHOW TABLES§/c§ without arguments shows tables in the current catalog/schema context — always specify the catalog/schema explicitly in production code"
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
    summary: "Unity Catalog Volumes are the governed storage layer for non-tabular files (CSV, JSON, images, models, config files) within the Unity Catalog namespace. They use the path format §c§/Volumes/catalog/schema/volume/§/c§. Volumes provide the same access control (GRANT/REVOKE) as tables, replacing raw DBFS mounts for new data.",
    when_to_use: "Use Volumes for all new non-tabular file storage in Databricks — raw ingestion landing zones, ML model artifacts, configuration files, and reference data. Volumes provide auditability and row-level access control that raw DBFS mounts lack.",
    gotchas: [
      "Volume paths (§c§/Volumes/...§/c§) work with §c§spark.read§/c§, §c§dbutils.fs§/c§, and Python's §c§open()§/c§ — the path is mounted transparently on the driver",
      "DBFS mounts (§c§/mnt/...§/c§) are legacy — they bypass Unity Catalog governance. Migrate to Volumes for all new data assets"
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
    summary: "Unity Catalog uses SQL GRANT/REVOKE statements for fine-grained access control on catalogs, schemas, tables, views, and volumes. Privileges include §c§SELECT§/c§, §c§MODIFY§/c§, §c§ALL PRIVILEGES§/c§, §c§CREATE TABLE§/c§, §c§USE CATALOG§/c§, §c§USE SCHEMA§/c§. Grants can target users, service principals, or groups.",
    when_to_use: "Grant §c§SELECT§/c§ on tables to analyst groups. Grant §c§MODIFY§/c§ to ETL service principals. Grant §c§USE CATALOG§/c§ and §c§USE SCHEMA§/c§ alongside any table-level grant — without them, users cannot navigate to the table even if they have SELECT on it.",
    gotchas: [
      "A user needs §c§USE CATALOG§/c§ AND §c§USE SCHEMA§/c§ in addition to table-level privileges — table-only grants without namespace privileges silently fail",
      "Granting on a schema does not automatically grant on existing tables within it — use §c§GRANT ... ON ALL TABLES IN SCHEMA§/c§ to cover existing tables"
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
    summary: "Databricks uses several path namespaces: §c§dbfs:/§/c§ for the legacy Databricks File System, §c§/Volumes/§/c§ for Unity Catalog Volumes, and native cloud storage URIs (§c§s3://§/c§, §c§abfss://§/c§, §c§gs://§/c§). The §c§file:/§/c§ prefix accesses the local driver node filesystem (not distributed). All Spark APIs and §c§dbutils.fs§/c§ understand all these schemes.",
    when_to_use: "Use §c§/Volumes/§/c§ for all new data in Databricks. Use native cloud URIs (§c§s3://§/c§, §c§abfss://§/c§) for cross-platform pipelines or when accessing data outside Databricks. Use §c§file:/§/c§ only for driver-local temp files.",
    gotchas: [
      "§c§dbfs:/§/c§ paths are accessible from all nodes; §c§file:/§/c§ paths are driver-only — reading a §c§file:/§/c§ path with §c§spark.read§/c§ will fail on executors",
      "Azure ADLS Gen2 uses §c§abfss://§/c§ (note the double §c§s§/c§) — using the older §c§wasbs://§/c§ scheme works but bypasses AAD-based auth"
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
    summary: "In Databricks, §c§spark.sql()§/c§ is heavily used alongside the DataFrame API — many Databricks-specific operations (Unity Catalog DDL, Delta maintenance, OPTIMIZE, VACUUM, RESTORE) are only available as SQL. Python f-strings allow injecting runtime variables into SQL strings. Results are always returned as a DataFrame.",
    when_to_use: "Use §c§spark.sql()§/c§ for Delta maintenance commands (§c§OPTIMIZE§/c§, §c§VACUUM§/c§, §c§RESTORE§/c§) that have no Python API equivalent. Use f-strings carefully — they're convenient but vulnerable to SQL injection if values come from untrusted input.",
    gotchas: [
      "F-string SQL injection: never use untrusted user input in f-string SQL. Use parameterised queries or validate/escape input first",
      "§c§spark.sql()§/c§ results are lazy — for DDL/DML operations call §c§.collect()§/c§ or cast to void to force execution; they don't always trigger automatically"
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

  "variant & semi-structured::variant type": {
    summary: "§c§VARIANT§/c§ (Spark 4.0+, GA in 4.1) is a native binary type for semi-structured data — JSON-like nested objects and arrays stored in one column without a fixed schema, while remaining efficiently queryable. Parse JSON with §c§parse_json()§/c§, extract fields with §c§variant_get(v, '$.path', 'type')§/c§ or the §c§:§/c§ path operator in SQL, and check types with §c§schema_of_variant()§/c§. Spark 4.1 adds shredding for faster reads.",
    when_to_use: "Use §c§VARIANT§/c§ for ingesting evolving or heterogeneous JSON (IoT payloads, event/web logs, API responses) where a rigid §c§StructType§/c§ would break on schema drift. It avoids repeated parse costs at query time, unlike storing raw JSON strings. Prefer an explicit §c§StructType§/c§ when the schema is stable and known.",
    gotchas: ["§c§VARIANT§/c§ requires Spark 4.0+ (Databricks Runtime 15.3+); it does not exist in Spark 3.x", "Path extraction returns §c§NULL§/c§ for missing keys rather than erroring — validate presence when NULLs are meaningful in your data", "With ANSI mode on (Spark 4.0 default), §c§variant_get§/c§ with a wrong target type raises a cast error instead of returning NULL"],
    example: `from pyspark.sql import functions as F

# Parse a JSON string column into VARIANT
df = df.withColumn("v", F.parse_json(F.col("json_str")))

# Extract nested fields (typed)
df = df.select(
    F.variant_get("v", "$.user.id",   "int").alias("user_id"),
    F.variant_get("v", "$.event",     "string").alias("event"),
    F.variant_get("v", "$.tags[0]",   "string").alias("first_tag"),
)

# SQL path syntax with the colon operator
df.createOrReplaceTempView("events")
spark.sql("""
    SELECT v:user.id::int    AS user_id,
           v:event::string   AS event,
           v:metrics.score::double AS score
    FROM events
    WHERE v:event::string = 'purchase'
""")

# Inspect the inferred structure
df.select(F.schema_of_variant("v")).show(truncate=False)`
  },

  "native plotting::.plot() api": {
    summary: "Spark 4.0 adds native Plotly-based plotting directly on PySpark DataFrames via §c§df.plot§/c§ — no manual §c§.toPandas()§/c§ conversion. Spark automatically samples or aggregates the data before rendering. Supports §c§.plot.line()§/c§, §c§.plot.bar()§/c§, §c§.plot.scatter()§/c§, §c§.plot.hist()§/c§, §c§.plot.box()§/c§, §c§.plot.pie()§/c§, and §c§.plot.area()§/c§.",
    when_to_use: "Use for quick exploratory visualisation inside notebooks (Databricks, Jupyter) when you want a chart straight from a Spark DataFrame. For very large results, pre-aggregate with §c§groupBy().agg()§/c§ first so the plotted sample is meaningful. For production dashboards, still export to a BI tool.",
    gotchas: ["Requires Spark 4.0+ and §c§plotly§/c§ installed on the driver (§c§pip install plotly§/c§)", "Spark samples/limits rows before plotting — a raw §c§.plot.scatter()§/c§ on billions of rows shows a sample, not every point; aggregate first for accuracy", "In Databricks, the built-in §c§display(df)§/c§ charting is still available and does not require plotly"],
    example: `# Spark 4.0+ native plotting (Plotly backend)
# pip install plotly

# Line chart straight from a Spark DataFrame
monthly = (df.groupBy("month")
             .agg(F.sum("revenue").alias("revenue"))
             .orderBy("month"))
fig = monthly.plot.line(x="month", y="revenue")
fig.show()

# Bar chart of top categories
(df.groupBy("category")
   .count()
   .orderBy(F.desc("count"))
   .limit(10)
   .plot.bar(x="category", y="count"))

# Histogram of a numeric column (Spark bins server-side)
df.plot.hist(column="amount", bins=50)

# Scatter (sampled automatically for large data)
df.plot.scatter(x="days_active", y="ltv")`
  },

  "spark connect::client-server": {
    summary: "Spark Connect (GA in Spark 4.0) is a client-server protocol that decouples your application from the Spark driver. The client builds an unresolved logical plan and sends it over gRPC to a remote Spark cluster. The thin client §c§pyspark-client§/c§ is ~1.5 MB (vs ~355 MB for full PySpark) and needs no local JVM — install with §c§pip install pyspark-client§/c§. Connect from IDEs, notebooks, or apps via a connection string.",
    when_to_use: "Use Spark Connect for new applications that embed Spark from a lightweight client (IDE, web service, thin container), for multi-language access (Go/Rust/Swift clients exist), or when you want to decouple app lifecycle from the cluster. On Databricks, Databricks Connect is built on Spark Connect.",
    gotchas: ["Not every RDD-level or §c§SparkContext§/c§ API is available over Connect — it targets the DataFrame/SQL API. Code using §c§spark.sparkContext§/c§ internals may not port", "Requires Spark 4.0+ server; the client and server minor versions should be compatible", "A remote session is created with §c§SparkSession.builder.remote('sc://host:port')§/c§ rather than §c§.master()§/c§"],
    example: `# Thin client install (no JVM):  pip install pyspark-client

from pyspark.sql import SparkSession

# Connect to a remote Spark 4.0 cluster over gRPC
spark = (SparkSession.builder
         .remote("sc://spark-host:15002")
         .getOrCreate())

# From here the DataFrame API is identical to classic PySpark
df = spark.read.table("sales")
(df.groupBy("region")
   .agg({"revenue": "sum"})
   .show())

# Databricks: Databricks Connect is built on Spark Connect
# from databricks.connect import DatabricksSession
# spark = DatabricksSession.builder.remote(
#     host=..., token=..., cluster_id=...).getOrCreate()`
  },

  "python udtfs::table functions": {
    summary: "Python UDTFs (User-Defined Table Functions, Spark 4.0+) return multiple rows and columns per input row — unlike scalar UDFs which return one value. Define a class with an §c§eval()§/c§ method that §c§yield§/c§s tuples, decorate with §c§@udtf§/c§ (or register for SQL), and call it with §c§LATERAL§/c§ in SQL or directly in Python. Polymorphic UDTFs can return different schemas depending on input.",
    when_to_use: "Use a UDTF to explode/expand one row into many — parsing a document into tokens, fanning out a nested structure, generating rows from a range, or emitting variable-length output. It replaces awkward §c§explode()§/c§ + UDF combinations for complex row-generating logic.",
    gotchas: ["Requires Spark 4.0+; needs a §c§returnType§/c§ (a §c§StructType§/c§ or DDL string) unless using §c§analyze()§/c§ for polymorphic schemas", "Like scalar UDFs, UDTFs run Python per input row — prefer built-in functions (§c§explode§/c§, §c§inline§/c§, §c§posexplode§/c§) when they suffice", "Arrow-optimized UDTF decorators (Spark 4.1) reduce serialisation overhead"],
    example: `from pyspark.sql.functions import udtf

# A UDTF that splits a string into (word, length) rows
@udtf(returnType="word: string, length: int")
class SplitWords:
    def eval(self, text: str):
        for w in (text or "").split():
            yield (w, len(w))

# Call directly in Python
SplitWords(lit("the quick brown fox")).show()
# +-----+------+
# | word|length|
# +-----+------+
# |  the|     3|  ...

# Register and use in SQL with LATERAL
spark.udtf.register("split_words", SplitWords)
spark.sql("""
    SELECT t.word, t.length
    FROM docs, LATERAL split_words(docs.body) AS t
""")`
  },

  "liquid clustering::cluster by": {
    summary: "Liquid clustering replaces §c§PARTITIONED BY§/c§ + §c§ZORDER§/c§ with a single §c§CLUSTER BY§/c§ clause. It organises data by clustering keys using an incremental Hilbert-curve algorithm — §c§OPTIMIZE§/c§ only rewrites newly-written data, not the whole table. GA on Delta tables in DBR 15.2+. §c§CLUSTER BY AUTO§/c§ (UC managed tables, DBR 15.4 LTS+) lets predictive optimization choose and adapt keys from your query history.",
    when_to_use: "Databricks recommends liquid clustering for all new tables, including streaming tables and materialized views. Use manual §c§CLUSTER BY (cols)§/c§ when you know your filter columns; use §c§CLUSTER BY AUTO§/c§ on UC managed tables to let Databricks decide. Unlike partitioning, you can change clustering keys later without rewriting existing data.",
    gotchas: ["Maximum 4 clustering keys; the useful maximum is usually 2–3 (Hilbert encoding loses locality as dimensions grow)", "Liquid clustering and §c§PARTITIONED BY§/c§ are mutually exclusive — you cannot combine them on one table", "After changing clustering keys, run §c§OPTIMIZE FULL§/c§ (DBR 16.0+) once to recluster all existing data; regular §c§OPTIMIZE§/c§ only clusters new data", "§c§CLUSTER BY AUTO§/c§ requires predictive optimization and must be re-specified in §c§CREATE OR REPLACE§/c§ or it is turned off"],
    example: `-- Create with manual clustering keys
CREATE TABLE prod.sales.events (
    event_ts TIMESTAMP, user_id BIGINT, event STRING
) USING DELTA
CLUSTER BY (event_ts, user_id);

-- Or let Databricks choose & adapt keys (UC managed)
CREATE TABLE prod.sales.events_auto (
    event_ts TIMESTAMP, user_id BIGINT
) USING DELTA CLUSTER BY AUTO;

-- Change clustering keys later (no rewrite until OPTIMIZE)
ALTER TABLE prod.sales.events CLUSTER BY (user_id);

-- Cluster new data (incremental)
OPTIMIZE prod.sales.events;

-- Fully recluster after a key change (DBR 16.0+)
OPTIMIZE prod.sales.events FULL;

-- Recluster a subset by predicate (DBR 18.1+)
OPTIMIZE prod.sales.events FULL WHERE event_ts >= '2025-01-01';

-- Python: keys at create time (DBR 16.4+ API)
(DeltaTable.create(spark)
   .tableName("prod.sales.events_py")
   .addColumn("event_ts", "TIMESTAMP")
   .addColumn("user_id",  "BIGINT")
   .clusterBy("event_ts", "user_id")
   .execute())`
  },

  "lakeflow pipelines::declarative etl": {
    summary: "Lakeflow Spark Declarative Pipelines (formerly Delta Live Tables / DLT) is Databricks' declarative ETL framework — you define tables/views and Databricks manages orchestration, dependencies, and incremental refresh. The Python module was renamed: §c§import dlt§/c§ becomes §c§from pyspark import pipelines as dp§/c§. §c§@dlt.table§/c§ is now §c§@dp.table§/c§ (streaming tables) and §c§@dp.materialized_view§/c§ (materialized views). Existing DLT code still runs unchanged.",
    when_to_use: "Use declarative pipelines for production ETL where you want managed dependency resolution, data-quality expectations, and automatic incremental processing rather than hand-orchestrated jobs. Use the §c§AUTO CDC§/c§ APIs (§c§create_auto_cdc_flow()§/c§) for change-data-capture with automatic SCD Type 1/2 handling.",
    gotchas: ["The rename is backward-compatible: §c§import dlt§/c§ and §c§@dlt.table§/c§ still work, but new code should use §c§from pyspark import pipelines as dp§/c§", "§c§APPLY CHANGES§/c§ / §c§apply_changes()§/c§ are superseded by §c§AUTO CDC§/c§ / §c§create_auto_cdc_flow()§/c§ (same signature); Databricks recommends the new APIs", "The §c§pipelines§/c§ module only exists inside a pipeline context — you cannot import it in a normal notebook or job", "'Databricks Jobs' is now 'Lakeflow Jobs' — another rename with no migration required"],
    example: `from pyspark import pipelines as dp   # was: import dlt
from pyspark.sql import functions as F

# Streaming table (was @dlt.table)
@dp.table(comment="Raw events, ingested incrementally")
def bronze_events():
    return (spark.readStream
              .format("cloudFiles")
              .option("cloudFiles.format", "json")
              .load("/Volumes/prod/raw/events/"))

# Materialized view (was @dlt.table on a batch query)
@dp.materialized_view(comment="Daily revenue by region")
def gold_daily_revenue():
    return (spark.read.table("silver_orders")
              .groupBy("region", F.to_date("order_ts").alias("day"))
              .agg(F.sum("revenue").alias("revenue")))

# Data-quality expectations
@dp.table
@dp.expect_or_drop("valid_id", "user_id IS NOT NULL")
def silver_events():
    return spark.read.table("bronze_events").dropDuplicates(["event_id"])

# CDC with AUTO CDC (was apply_changes)
dp.create_auto_cdc_flow(
    target="silver_customers",
    source="cdc_feed",
    keys=["customer_id"],
    sequence_by=F.col("sequence_num"),
    stored_as_scd_type=2)`
  }
};
