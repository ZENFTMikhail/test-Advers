import { Meteor } from "meteor/meteor";
import { createRoot } from "react-dom/client";
import { App } from "/imports/ui/App";
import "bootstrap/dist/css/bootstrap.min.css";

Meteor.startup(() => {
  Meteor.subscribe("customers");

  const container = document.getElementById("react-target");
  if (container) {
    createRoot(container).render(<App />);
  }
});
