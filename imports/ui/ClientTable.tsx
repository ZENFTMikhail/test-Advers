import React, { useEffect, useRef } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { CustomersCollection } from "/client/collection";
import type { Customer } from "../api/types";
import { Meteor } from "meteor/meteor";

export const ClientTable: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  const customers = useTracker<Customer[]>(() => {
    return CustomersCollection.find({}, { sort: { id: 1 } }).fetch();
  }, []);

  useEffect(() => {
    if (!tableRef.current) return;

    const translateText = async (text: string): Promise<string> => {
      if (!text || text.trim() === "") return text;

      try {
        const translated = await Meteor.callAsync("translate.get", text);
        return translated;
      } catch (err) {
        console.error("Ошибка перевода:", err);
        return text;
      }
    };

    const processCell = async (cell: Element) => {
      const originalText = cell.textContent?.trim();
      if (originalText && !cell.getAttribute("data-translated")) {
        const translated = await translateText(originalText);
        if (translated !== originalText) {
          cell.textContent = translated;
          cell.setAttribute("data-translated", "true");
          cell.setAttribute("data-original", originalText);
        }
      }
    };

    const observer = new MutationObserver(async (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const cells = element.classList?.contains("__t")
                ? [element]
                : Array.from(element.querySelectorAll?.(".__t") || []);

              cells.forEach((cell) => processCell(cell));
            }
          });
        }

        if (mutation.type === "characterData") {
          const parent = mutation.target.parentElement;
          if (parent?.classList?.contains("__t")) {
            await processCell(parent);
          }
        }
      }
    });

    observer.observe(tableRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const existingCells = tableRef.current.querySelectorAll(".__t");
    existingCells.forEach((cell) => processCell(cell));

    return () => observer.disconnect();
  }, [customers]);

  if (customers.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4" ref={tableRef}>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Full name</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: Customer) => (
                <tr key={c._id}>
                  <td>{c.id}</td>
                  <td>{c.full_name}</td>
                  <td className="__t">{c.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
