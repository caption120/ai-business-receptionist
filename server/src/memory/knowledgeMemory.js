const documents = [];

export const addDocument = (doc) => {
  documents.unshift({
    id: Date.now() + Math.random(),
    status: "Processing",
    ...doc,
  });
  return documents[0];
};

export const setDocumentStatus = (id, status, extra = {}) => {
  const doc = documents.find((d) => d.id === id);
  if (doc) {
    Object.assign(doc, { status, ...extra });
  }
  return doc;
};

export const getDocuments = () => documents;
