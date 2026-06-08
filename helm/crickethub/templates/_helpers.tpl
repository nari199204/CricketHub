{{- define "crickethub.image" -}}
{{ .Values.image.registry }}/{{ . }}:{{ $.Values.image.tag }}
{{- end -}}
