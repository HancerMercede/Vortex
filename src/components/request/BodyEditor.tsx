import { useRequestStore } from '../../application/stores/requestStore';

export function BodyEditor() {
  const body = useRequestStore((state) => state.body) || '';
  const setBody = useRequestStore((state) => state.setBody);

  return (
    <div className="panel-body">
      <div className="section-header">
        <span>◇ REQUEST BODY</span>
        <span className="json-badge">JSON</span>
      </div>
      <textarea
        className="body-editor"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder='{"key": "value"}'
      />
    </div>
  );
}
