import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportEditorView } from '../components/report-editor-view';
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

  const composedCitationText = useMemo(() => {
    return citations.join('\n');
  }, [citations]);

  const markUnsaved = () => {
    setSaveStatus((previous) => {
      return previous === 'saving' ? previous : 'unsaved';
    });
  };

  return (
    <ReportEditorView
      reportId={reportId}
      title={title}
      content={content}
      aiMode={aiMode}
      saveStatus={saveStatus}
      lastSavedAt={lastSavedAt}
      references={references}
      citations={citations}
      chatMessages={chatMessages}
      chatInput={chatInput}
      referenceSearchOpen={referenceSearchOpen}
      referenceSearchQuery={referenceSearchQuery}
      referenceSearchResults={referenceSearchResults}
      exportOpen={exportOpen}
      isBusy={isBusy}
      errorMessage={errorMessage}
      onChangeTitle={(value) => {
        setTitle(value);
        markUnsaved();
      }}
      onChangeContent={(value) => {
        setContent(value);
        markUnsaved();
      }}
      onChangeAiMode={setAiMode}
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
      onHome={() => {
        navigate('/home');
      }}
      onOpenExport={() => {
        setExportOpen(true);
      }}
      onCloseExport={() => {
        setExportOpen(false);
      }}
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
      onChatInput={setChatInput}
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
      onAddReference={() => {
        void (async () => {
          try {
            const created = await createReferenceAsync({
              reportId,
              title: `Reference ${references.length + 1}`,
            });
            setReferences([...references, created]);
            setCitations([...citations, created.citation ?? created.title]);
            markUnsaved();
          } catch {
            // API未実装時は何もしない。
          }
        })();
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
      onOpenReferenceSearch={() => {
        setReferenceSearchOpen(true);
      }}
      onCloseReferenceSearch={() => {
        setReferenceSearchOpen(false);
      }}
      onChangeReferenceSearchQuery={setReferenceSearchQuery}
      onSearchReference={() => {
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
      onAddReferenceFromSearch={(result) => {
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
  );
};
