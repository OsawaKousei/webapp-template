import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  chatAsync,
  createReferenceAsync,
  deleteReferenceAsync,
  exportReportAsync,
  fetchReferencesAsync,
  fetchReportDetailAsync,
  saveReportAsync,
  searchReferenceAsync,
  type ChatMessage,
  type ReferenceItem,
  type ReferenceSearchResult,
} from '../api/report-editor-api';
import { ReportEditorLayout } from '../layouts/report-editor-layout';
import { ReportEditorHeaderWidget } from './report-editor-header-widget';
import { ReportEditorSidePanelWidget } from './report-editor-side-panel-widget';
import { ReportEditorContentWidget } from './report-editor-content-widget';
import { ReportEditorChatWidget } from './report-editor-chat-widget';
import { ReportEditorReferenceSearchDialogWidget } from './report-editor-reference-search-dialog-widget';
import { ReportEditorExportDialogWidget } from './report-editor-export-dialog-widget';

export const ReportEditorWidget = () => {
  const navigate = useNavigate();
  const params = useParams();
  const reportId = params.id ?? '';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiMode, setAiMode] = useState('speed');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [references, setReferences] = useState<readonly ReferenceItem[]>([]);
  const [citations, setCitations] = useState<readonly string[]>([]);
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [referenceSearchOpen, setReferenceSearchOpen] = useState(false);
  const [referenceSearchQuery, setReferenceSearchQuery] = useState('');
  const [referenceSearchResults, setReferenceSearchResults] = useState<
    readonly ReferenceSearchResult[]
  >([]);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (reportId.length === 0) {
      navigate('/home');
      return;
    }

    void (async () => {
      try {
        setIsBusy(true);
        const detail = await fetchReportDetailAsync(reportId);
        setTitle(detail.title);
        setContent(detail.content);
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch {
        setErrorMessage('レポートの取得に失敗しました。');
      } finally {
        setIsBusy(false);
      }

      try {
        const fetchedReferences = await fetchReferencesAsync(reportId);
        setReferences(fetchedReferences);
        setCitations(
          fetchedReferences
            .map((reference) => {
              return reference.citation ?? `${reference.title}`;
            })
            .filter((value) => value.length > 0),
        );
      } catch {
        // API未実装時は何もしない。
      }
    })();
  }, [navigate, reportId]);

  const composedCitationText = citations.join('\n');

  const markUnsaved = () => {
    setSaveStatus((previous) => {
      return previous === 'saving' ? previous : 'unsaved';
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <ReportEditorHeaderWidget
        reportId={reportId}
        title={title}
        aiMode={aiMode}
        contentLength={content.length}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        isBusy={isBusy}
        onChangeTitle={(value) => {
          setTitle(value);
          markUnsaved();
        }}
        onChangeAiMode={setAiMode}
        onHome={() => {
          navigate('/home');
        }}
        onSave={() => {
          void (async () => {
            try {
              setIsBusy(true);
              setSaveStatus('saving');
              await saveReportAsync({ reportId, title, content });
              setSaveStatus('saved');
              setLastSavedAt(new Date());
            } catch {
              setErrorMessage('保存に失敗しました。');
              setSaveStatus('unsaved');
            } finally {
              setIsBusy(false);
            }
          })();
        }}
        onOpenExport={() => {
          setExportOpen(true);
        }}
      />

      {errorMessage === null ? null : (
        <p className="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <ReportEditorLayout
        sidePanel={
          <ReportEditorSidePanelWidget
            isCollapsed={isSidePanelCollapsed}
            references={references}
            citations={citations}
            onToggleCollapse={() => {
              setIsSidePanelCollapsed((previous) => !previous);
            }}
            onOpenReferenceSearch={() => {
              setReferenceSearchOpen(true);
            }}
            onRunPlagiarismCheck={() => {
              setErrorMessage('剽窃チェッカーは現在準備中です。');
            }}
            onAddReference={() => {
              void (async () => {
                try {
                  const created = await createReferenceAsync({
                    reportId,
                    title: `Reference ${references.length + 1}`,
                  });
                  setReferences([...references, created]);
                  setCitations([
                    ...citations,
                    created.citation ?? created.title,
                  ]);
                  markUnsaved();
                } catch {
                  // API未実装時は何もしない。
                }
              })();
            }}
            onInsertCitations={() => {
              if (composedCitationText.length === 0) {
                return;
              }

              setContent((previous) => {
                return `${previous}\n\n${composedCitationText}`.trim();
              });
              markUnsaved();
            }}
            onCopyCitations={() => {
              void navigator.clipboard.writeText(composedCitationText);
            }}
            onDeleteReference={(referenceId) => {
              void (async () => {
                try {
                  await deleteReferenceAsync(referenceId);
                } catch {
                  // API未実装時は何もしない。
                }

                const nextReferences = references.filter((reference) => {
                  return reference.referenceId !== referenceId;
                });
                setReferences(nextReferences);
                setCitations(
                  nextReferences.map((reference) => {
                    return reference.citation ?? reference.title;
                  }),
                );
                markUnsaved();
              })();
            }}
          />
        }
        editor={
          <ReportEditorContentWidget
            content={content}
            onChangeContent={(value) => {
              setContent(value);
              markUnsaved();
            }}
          />
        }
        chat={
          <ReportEditorChatWidget
            chatMessages={chatMessages}
            chatInput={chatInput}
            isBusy={isBusy}
            onChangeChatInput={setChatInput}
            onSendChat={() => {
              void (async () => {
                if (chatInput.trim().length === 0) {
                  return;
                }

                const nextMessages: readonly ChatMessage[] = [
                  ...chatMessages,
                  { role: 'user', content: chatInput },
                ];

                setChatMessages(nextMessages);
                setChatInput('');

                try {
                  setIsBusy(true);
                  const answer = await chatAsync({
                    reportId,
                    mode: aiMode,
                    messages: nextMessages,
                  });
                  setChatMessages([
                    ...nextMessages,
                    { role: 'assistant', content: answer },
                  ]);
                } catch {
                  setChatMessages([
                    ...nextMessages,
                    {
                      role: 'assistant',
                      content: '応答の取得に失敗しました。',
                    },
                  ]);
                } finally {
                  setIsBusy(false);
                }
              })();
            }}
          />
        }
      />

      <ReportEditorReferenceSearchDialogWidget
        open={referenceSearchOpen}
        query={referenceSearchQuery}
        results={referenceSearchResults}
        onChangeOpen={setReferenceSearchOpen}
        onChangeQuery={setReferenceSearchQuery}
        onSearch={() => {
          void (async () => {
            if (referenceSearchQuery.trim().length === 0) {
              return;
            }

            try {
              const results = await searchReferenceAsync({
                reportId,
                query: referenceSearchQuery,
              });
              setReferenceSearchResults(results);
            } catch {
              // API未実装時は何もしない。
            }
          })();
        }}
        onAddReference={(result) => {
          const newReference: ReferenceItem = {
            referenceId: result.id,
            title: result.title,
            authors: result.authors,
            year: result.year,
            citation: `${result.authors ?? 'Unknown'} (${result.year ?? '-'}) ${result.title}`,
          };

          setReferences([...references, newReference]);
          setCitations([
            ...citations,
            newReference.citation ?? newReference.title,
          ]);
          markUnsaved();
        }}
        onInsertIndirectQuote={(result) => {
          const quote = `(${result.authors ?? 'Unknown'}, ${result.year ?? '-'}) ${result.title}`;
          setContent((previous) => {
            return `${previous}\n${quote}`.trim();
          });
          markUnsaved();
        }}
      />

      <ReportEditorExportDialogWidget
        open={exportOpen}
        onChangeOpen={setExportOpen}
        onExport={(format) => {
          void (async () => {
            try {
              await exportReportAsync({ reportId, format });
              setExportOpen(false);
            } catch {
              // API未実装時は何もしない。
            }
          })();
        }}
      />
    </div>
  );
};
