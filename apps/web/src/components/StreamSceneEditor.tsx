import { useEffect, useState } from 'react';
import {
  DEFAULT_SCENE,
  loadStreamScene,
  newOverlayLayer,
  saveStreamScene,
  type OverlayLayerType,
  type StreamOverlayLayer,
  type StreamScene,
} from '../lib/streamScene';

const FONTS = [
  'Inter, system-ui, sans-serif',
  'Georgia, serif',
  '"Playfair Display", Georgia, serif',
  'Impact, Haettenschweiler, sans-serif',
  '"Comic Sans MS", "Comic Sans", cursive',
  'monospace',
];

export function StreamSceneEditor() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = scene.layers.find((l) => l.id === selectedId) || null;

  useEffect(() => {
    saveStreamScene(scene);
  }, [scene]);

  function patchStandby(partial: Partial<StreamScene['standby']>) {
    setScene((s) => ({ ...s, standby: { ...s.standby, ...partial } }));
  }

  function patchLayer(id: string, partial: Partial<StreamOverlayLayer>) {
    setScene((s) => ({
      ...s,
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }));
  }

  function addLayer(type: OverlayLayerType) {
    const layer = newOverlayLayer({
      type,
      name: type === 'css' ? 'CSS FX' : type === 'html' ? 'HTML overlay' : type === 'image' ? 'Image' : type === 'iframe' ? 'Iframe media' : 'Ticker',
      content:
        type === 'css'
          ? `@keyframes pulse { 50% { opacity: 0.4; transform: scale(1.05); } }\n.box { width:100%;height:100%;border:2px solid gold;animation:pulse 2s infinite; }`
          : type === 'html'
            ? `<div style="display:grid;place-items:center;height:100%;color:gold;font-weight:900;font-size:2rem;">VIP</div>`
            : type === 'image'
              ? '/favicon.svg'
              : type === 'iframe'
                ? 'https://customer-wx8j23tjjjpkb37k.cloudflarestream.com/3f100cf1895b63cf27b748c69c8ba10c/iframe'
                : 'CUSTOM TICKER · ',
      zIndex: 20 + scene.layers.length,
    });
    setScene((s) => ({ ...s, layers: [...s.layers, layer] }));
    setSelectedId(layer.id);
  }

  function moveLayer(id: string, dir: 'front' | 'back') {
    setScene((s) => {
      const layers = s.layers.map((l) => {
        if (l.id !== id) return l;
        return { ...l, zIndex: dir === 'front' ? l.zIndex + 5 : Math.max(0, l.zIndex - 5) };
      });
      return { ...s, layers };
    });
  }

  function removeLayer(id: string) {
    setScene((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="sceneEditor">
      <div className="sceneEditorHead">
        <strong>Standby &amp; overlay director</strong>
        <span className="cMuted">Edits push to the public /live window (this browser + open tabs)</span>
      </div>

      <section className="studioBlock">
        <span className="studioBlockLabel">Standby message (when not live)</span>
        <label className="easyField">
          <span>Main text</span>
          <input value={scene.standby.text} onChange={(e) => patchStandby({ text: e.target.value })} />
        </label>
        <label className="easyField">
          <span>Subtext</span>
          <input value={scene.standby.subtext} onChange={(e) => patchStandby({ subtext: e.target.value })} />
        </label>
        <label className="easyField">
          <span>Scrolling ticker</span>
          <input value={scene.standby.ticker} onChange={(e) => patchStandby({ ticker: e.target.value })} />
        </label>
        <label className="easyField">
          <span>
            <input
              type="checkbox"
              checked={scene.standbyMusic}
              onChange={(e) => setScene((s) => ({ ...s, standbyMusic: e.target.checked }))}
            />{' '}
            Play catalog music under standby
          </span>
        </label>
      </section>

      <section className="studioBlock">
        <span className="studioBlockLabel">Standby text style &amp; place</span>
        <div className="sceneGrid2">
          <label className="easyField">
            <span>Font</span>
            <select
              className="studioSelect"
              value={scene.standby.fontFamily}
              onChange={(e) => patchStandby({ fontFamily: e.target.value })}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f.split(',')[0].replace(/"/g, '')}
                </option>
              ))}
            </select>
          </label>
          <label className="easyField">
            <span>Weight</span>
            <input
              type="number"
              min={300}
              max={900}
              step={100}
              value={scene.standby.fontWeight}
              onChange={(e) => patchStandby({ fontWeight: Number(e.target.value) || 800 })}
            />
          </label>
          <label className="easyField">
            <span>Size (px)</span>
            <input
              type="number"
              min={16}
              max={120}
              value={scene.standby.fontSize}
              onChange={(e) => patchStandby({ fontSize: Number(e.target.value) || 42 })}
            />
          </label>
          <label className="easyField">
            <span>Transform</span>
            <select
              className="studioSelect"
              value={scene.standby.textTransform}
              onChange={(e) =>
                patchStandby({ textTransform: e.target.value as StreamScene['standby']['textTransform'] })
              }
            >
              <option value="none">none</option>
              <option value="uppercase">uppercase</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">capitalize</option>
            </select>
          </label>
          <label className="easyField">
            <span>Color</span>
            <input type="color" value={toColorInput(scene.standby.color)} onChange={(e) => patchStandby({ color: e.target.value })} />
          </label>
          <label className="easyField">
            <span>Sub color</span>
            <input type="color" value={toColorInput(scene.standby.subColor)} onChange={(e) => patchStandby({ subColor: e.target.value })} />
          </label>
        </div>
        <div className="studioSliders">
          <label className="studioSlider">
            <span>Position X {scene.standby.x}%</span>
            <input type="range" min={5} max={95} value={scene.standby.x} onChange={(e) => patchStandby({ x: Number(e.target.value) })} />
          </label>
          <label className="studioSlider">
            <span>Position Y {scene.standby.y}%</span>
            <input type="range" min={5} max={95} value={scene.standby.y} onChange={(e) => patchStandby({ y: Number(e.target.value) })} />
          </label>
        </div>
        <label className="easyField">
          <span>Text shadow CSS</span>
          <input value={scene.standby.textShadow} onChange={(e) => patchStandby({ textShadow: e.target.value })} />
        </label>
        <label className="easyField">
          <span>Custom CSS (standby page)</span>
          <textarea
            className="sceneCode"
            rows={4}
            value={scene.standby.customCss}
            onChange={(e) => patchStandby({ customCss: e.target.value })}
            placeholder=".standbySoonMain { animation: ... }"
          />
        </label>
      </section>

      <section className="studioBlock">
        <span className="studioBlockLabel">Custom overlay layers (live window)</span>
        <div className="studioChipRow">
          <button type="button" className="studioChip" onClick={() => addLayer('css')}>
            + CSS FX
          </button>
          <button type="button" className="studioChip" onClick={() => addLayer('html')}>
            + HTML
          </button>
          <button type="button" className="studioChip" onClick={() => addLayer('image')}>
            + Image URL
          </button>
          <button type="button" className="studioChip" onClick={() => addLayer('iframe')}>
            + Iframe / video
          </button>
        </div>
        <ul className="sceneLayerList">
          {scene.layers
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((l) => (
              <li key={l.id} className={selectedId === l.id ? 'active' : ''}>
                <button type="button" className="sceneLayerPick" onClick={() => setSelectedId(l.id)}>
                  <span>
                    z{l.zIndex} · {l.name} ({l.type})
                  </span>
                  <span>{l.visible ? 'on' : 'off'}</span>
                </button>
              </li>
            ))}
        </ul>

        {selected ? (
          <div className="sceneLayerEditor">
            <label className="easyField">
              <span>Name</span>
              <input value={selected.name} onChange={(e) => patchLayer(selected.id, { name: e.target.value })} />
            </label>
            <label className="easyField">
              <span>
                <input
                  type="checkbox"
                  checked={selected.visible}
                  onChange={(e) => patchLayer(selected.id, { visible: e.target.checked })}
                />{' '}
                Visible on live window
              </span>
            </label>
            <label className="easyField">
              <span>Content (CSS / HTML / URL)</span>
              <textarea
                className="sceneCode"
                rows={6}
                value={selected.content}
                onChange={(e) => patchLayer(selected.id, { content: e.target.value })}
              />
            </label>
            <div className="studioSliders">
              <label className="studioSlider">
                <span>X {selected.x}%</span>
                <input type="range" min={0} max={90} value={selected.x} onChange={(e) => patchLayer(selected.id, { x: Number(e.target.value) })} />
              </label>
              <label className="studioSlider">
                <span>Y {selected.y}%</span>
                <input type="range" min={0} max={90} value={selected.y} onChange={(e) => patchLayer(selected.id, { y: Number(e.target.value) })} />
              </label>
              <label className="studioSlider">
                <span>Width {selected.w}%</span>
                <input type="range" min={5} max={100} value={selected.w} onChange={(e) => patchLayer(selected.id, { w: Number(e.target.value) })} />
              </label>
              <label className="studioSlider">
                <span>Height {selected.h}%</span>
                <input type="range" min={5} max={100} value={selected.h} onChange={(e) => patchLayer(selected.id, { h: Number(e.target.value) })} />
              </label>
              <label className="studioSlider">
                <span>Opacity {selected.opacity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={selected.opacity}
                  onChange={(e) => patchLayer(selected.id, { opacity: Number(e.target.value) })}
                />
              </label>
              <label className="studioSlider">
                <span>Z-index {selected.zIndex}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selected.zIndex}
                  onChange={(e) => patchLayer(selected.id, { zIndex: Number(e.target.value) })}
                />
              </label>
            </div>
            <div className="cBtnRow">
              <button type="button" className="cBtn sm ghost" onClick={() => moveLayer(selected.id, 'front')}>
                Bring forward
              </button>
              <button type="button" className="cBtn sm ghost" onClick={() => moveLayer(selected.id, 'back')}>
                Send back
              </button>
              <button type="button" className="cBtn sm danger" onClick={() => removeLayer(selected.id)}>
                Delete layer
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="cBtnRow">
        <button
          type="button"
          className="cBtn ghost"
          onClick={() => {
            setScene(structuredClone(DEFAULT_SCENE));
            setSelectedId(null);
          }}
        >
          Reset scene defaults
        </button>
        <button type="button" className="cBtn primary" onClick={() => saveStreamScene(scene)}>
          Save &amp; push to /live
        </button>
      </div>
    </div>
  );
}

function toColorInput(c: string) {
  if (c.startsWith('#') && (c.length === 7 || c.length === 4)) return c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c;
  return '#ffd700';
}
