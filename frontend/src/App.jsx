import { useEffect, useMemo, useState } from "react";

const initialValues = {
  GC_Content: "",
  AT_Content: "",
  Num_A: "",
  Num_T: "",
  Num_C: "",
  Num_G: "",
  kmer_3_freq: "",
  Mutation_Flag: "0",
  Class_Label: "1",
};

export default function App() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [meta, setMeta] = useState(null);

  const apiBase = useMemo(() => "", []); // rely on same-origin or Vite proxy

  useEffect(() => {
    fetch(`${apiBase}/meta`).then(async (r) => {
      if (r.ok) setMeta(await r.json());
    }).catch(() => {});
  }, [apiBase]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === "" ? null : Number(v)])
      );
      const res = await fetch(`${apiBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setPrediction(json);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">DNA Disease Risk Predictor</h1>
          <div className="text-sm text-slate-500">FastAPI + React</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-5">
        <section className="md:col-span-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Enter Features</h2>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <Field label="GC_Content (%)" name="GC_Content" value={values.GC_Content} onChange={onChange} step="0.01" />
              <Field label="AT_Content (%)" name="AT_Content" value={values.AT_Content} onChange={onChange} step="0.01" />
              <Field label="Num_A" name="Num_A" value={values.Num_A} onChange={onChange} step="1" />
              <Field label="Num_T" name="Num_T" value={values.Num_T} onChange={onChange} step="1" />
              <Field label="Num_C" name="Num_C" value={values.Num_C} onChange={onChange} step="1" />
              <Field label="Num_G" name="Num_G" value={values.Num_G} onChange={onChange} step="1" />
              <Field label="kmer_3_freq" name="kmer_3_freq" value={values.kmer_3_freq} onChange={onChange} step="0.0001" />
              <Field label="Mutation_Flag (0/1)" name="Mutation_Flag" value={values.Mutation_Flag} onChange={onChange} step="1" min="0" max="1" />
              <Field label="Class_Label (0/1/2)" name="Class_Label" value={values.Class_Label} onChange={onChange} step="1" min="0" max="2" />

              <div className="col-span-full flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Predicting..." : "Predict"}
                </button>
                <button
                  type="button"
                  onClick={() => { setValues(initialValues); setPrediction(null); setError(""); }}
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>

              {error && (
                <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </form>
          </div>
        </section>

        <aside className="md:col-span-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-medium mb-4">Prediction</h2>
            {!prediction ? (
              <p className="text-slate-500">Submit the form to see the prediction.</p>
            ) : (
              <div className="space-y-3">
                <div className="text-2xl font-semibold">{prediction.prediction}</div>
                {prediction.classes && (
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Classes</div>
                    <div className="flex flex-wrap gap-2">
                      {prediction.classes.map((c, i) => (
                        <span
                          key={c}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm ${prediction.class_index === i ? "bg-slate-900 text-white" : "bg-slate-50"}`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Model Info</h3>
              {!meta ? (
                <div className="text-slate-400 text-sm">Loading...</div>
              ) : (
                <div className="text-sm text-slate-600 space-y-1">
                  <div>Target: <span className="font-medium">{meta.target}</span></div>
                  <div className="truncate">Features: <span className="font-medium">{meta.features?.join(", ")}</span></div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        Built with FastAPI + React + Tailwind
      </footer>
    </div>
  );
}

function Field({ label, name, value, onChange, ...rest }) {
  return (
    <label className="col-span-2 sm:col-span-1 text-sm">
      <span className="mb-1 block text-slate-600">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="number"
        className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-slate-400 focus:bg-white bg-slate-50"
        {...rest}
      />
    </label>
  );
}
