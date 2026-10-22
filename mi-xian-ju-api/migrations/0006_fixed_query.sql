UPDATE api_endpoints
SET request_json = '{"entry":"GET","params":{},"fixed":{"query":' || query_json || ',"header":{},"body":null}}'
WHERE request_json = '{}';

UPDATE api_endpoints
SET request_json = json_set(request_json, '$.fixed.query', json(query_json))
WHERE request_json != '{}'
  AND json_extract(request_json, '$.fixed.query') IS NULL;

ALTER TABLE api_endpoints DROP COLUMN query_json;
