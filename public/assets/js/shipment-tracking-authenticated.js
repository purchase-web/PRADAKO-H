/* -------------------------------------------------
   PMEW Shipment Tracking Portal
   Replace demo data and handlers with your live API.
   ------------------------------------------------- */

const shipmentDatabase = {
  "PMEW-EXP-260724": {
    title: "Export Shipment",
    status: "In Transit",
    currentStatus: "Vessel departed from Nhava Sheva",
    statusDescription:
      "Your shipment is moving toward the destination port as planned.",
    lastUpdated: "28 Jul 2026, 2:35 PM IST",
    carrier: "Maersk Line",
    estimatedDate: "11 Aug 2026",
    estimatedWindow: "Expected between 9:00 AM and 5:00 PM",
    scheduleConfidence: "On time",
    packageCount: "18 pallets",
    grossWeight: "12,480 kg",
    shippingMode: "Ocean freight",
    originName: "Nhava Sheva, India",
    originCode: "INNSA",
    destinationName: "Munich, Germany",
    destinationCode: "DE MUC",
    routeDistance: "Approx. 6,350 km",
    progress: 58,
    remainingTime: "14 days remaining",
    vehicleIcon: "ship",
    customerReference: "PO-IND-260714",
    bookingNumber: "MSK26072487",
    containerNumber: "MSKU 742819 6",
    incoterm: "CIF",
    timeline: [
      {
        state: "current",
        title: "Vessel departed origin port",
        description: "Container loaded and vessel departure confirmed.",
        date: "28 Jul 2026",
        time: "09:35 AM"
      },
      {
        state: "completed",
        title: "Customs clearance completed",
        description: "Export documentation and customs formalities approved.",
        date: "27 Jul 2026",
        time: "04:20 PM"
      },
      {
        state: "completed",
        title: "Container gated in",
        description: "Container received at Nhava Sheva terminal.",
        date: "26 Jul 2026",
        time: "11:10 AM"
      },
      {
        state: "completed",
        title: "Shipment dispatched from PMEW",
        description: "Goods inspected, sealed and released from the plant.",
        date: "24 Jul 2026",
        time: "03:45 PM"
      },
      {
        state: "completed",
        title: "Booking confirmed",
        description: "Carrier booking and shipping instructions accepted.",
        date: "22 Jul 2026",
        time: "12:15 PM"
      }
    ],
    documents: [
      { name: "Commercial Invoice", type: "PDF · 284 KB", icon: "file-text" },
      { name: "Packing List", type: "PDF · 194 KB", icon: "clipboard-list" },
      { name: "Bill of Lading", type: "PDF · 516 KB", icon: "ship-wheel" },
      { name: "Certificate of Origin", type: "PDF · 238 KB", icon: "badge-check" }
    ]
  },

  "PMEW-AIR-260719": {
    title: "Priority Air Shipment",
    status: "Customs Clearance",
    currentStatus: "Arrived at Frankfurt cargo terminal",
    statusDescription:
      "The shipment is awaiting import customs release before final road delivery.",
    lastUpdated: "28 Jul 2026, 1:10 PM IST",
    carrier: "Lufthansa Cargo",
    estimatedDate: "30 Jul 2026",
    estimatedWindow: "Expected before 6:00 PM",
    scheduleConfidence: "On time",
    packageCount: "6 crates",
    grossWeight: "1,860 kg",
    shippingMode: "Air freight",
    originName: "Mumbai, India",
    originCode: "BOM",
    destinationName: "Munich, Germany",
    destinationCode: "MUC",
    routeDistance: "Approx. 6,450 km",
    progress: 82,
    remainingTime: "2 days remaining",
    vehicleIcon: "plane",
    customerReference: "PO-AIR-260719",
    bookingNumber: "LH821964",
    containerNumber: "AKE 48276 LH",
    incoterm: "DAP",
    timeline: [
      {
        state: "current",
        title: "Import customs processing",
        description: "Shipment documents submitted to German customs.",
        date: "28 Jul 2026",
        time: "09:20 AM"
      },
      {
        state: "completed",
        title: "Arrived at Frankfurt",
        description: "Flight landed and cargo transferred to the import facility.",
        date: "28 Jul 2026",
        time: "05:40 AM"
      },
      {
        state: "completed",
        title: "Flight departed Mumbai",
        description: "Priority air cargo uplift confirmed.",
        date: "27 Jul 2026",
        time: "11:55 PM"
      },
      {
        state: "completed",
        title: "Export clearance completed",
        description: "Airway bill and export documents approved.",
        date: "27 Jul 2026",
        time: "04:10 PM"
      }
    ],
    documents: [
      { name: "Commercial Invoice", type: "PDF · 246 KB", icon: "file-text" },
      { name: "Packing List", type: "PDF · 180 KB", icon: "clipboard-list" },
      { name: "Air Waybill", type: "PDF · 328 KB", icon: "plane" },
      { name: "Inspection Certificate", type: "PDF · 206 KB", icon: "badge-check" }
    ]
  },

  "PMEW-DEL-260701": {
    title: "Completed Export Shipment",
    status: "Delivered",
    currentStatus: "Delivered to customer facility",
    statusDescription:
      "The shipment was received and signed for at the destination.",
    lastUpdated: "18 Jul 2026, 4:42 PM CEST",
    carrier: "DHL Global Forwarding",
    estimatedDate: "18 Jul 2026",
    estimatedWindow: "Delivered at 4:42 PM",
    scheduleConfidence: "Delivered",
    packageCount: "24 pallets",
    grossWeight: "17,240 kg",
    shippingMode: "Ocean + road",
    originName: "Nhava Sheva, India",
    originCode: "INNSA",
    destinationName: "Stuttgart, Germany",
    destinationCode: "DE STR",
    routeDistance: "Approx. 6,580 km",
    progress: 100,
    remainingTime: "Shipment completed",
    vehicleIcon: "truck",
    customerReference: "PO-EU-260701",
    bookingNumber: "DHL26070152",
    containerNumber: "DHLU 581037 4",
    incoterm: "DDP",
    timeline: [
      {
        state: "completed",
        title: "Shipment delivered",
        description: "Proof of delivery received from the consignee.",
        date: "18 Jul 2026",
        time: "04:42 PM"
      },
      {
        state: "completed",
        title: "Out for final delivery",
        description: "Cargo released to local delivery vehicle.",
        date: "18 Jul 2026",
        time: "08:20 AM"
      },
      {
        state: "completed",
        title: "Import customs cleared",
        description: "All duties and import formalities completed.",
        date: "17 Jul 2026",
        time: "02:35 PM"
      },
      {
        state: "completed",
        title: "Arrived at destination port",
        description: "Container discharged and transferred to inland transport.",
        date: "16 Jul 2026",
        time: "07:10 AM"
      },
      {
        state: "completed",
        title: "Vessel departed India",
        description: "Export vessel departure confirmed.",
        date: "03 Jul 2026",
        time: "10:50 PM"
      }
    ],
    documents: [
      { name: "Commercial Invoice", type: "PDF · 302 KB", icon: "file-text" },
      { name: "Packing List", type: "PDF · 217 KB", icon: "clipboard-list" },
      { name: "Bill of Lading", type: "PDF · 538 KB", icon: "ship-wheel" },
      { name: "Proof of Delivery", type: "PDF · 418 KB", icon: "signature" }
    ]
  }
};

const elements = {
  trackingForm: document.getElementById("trackingForm"),
  trackingInput: document.getElementById("trackingInput"),
  formMessage: document.getElementById("formMessage"),
  portalSection: document.getElementById("portalSection"),
  emptyStateSection: document.getElementById("emptyStateSection"),
  tryAgainButton: document.getElementById("tryAgainButton"),
  shipmentTitle: document.getElementById("shipmentTitle"),
  shipmentNumber: document.getElementById("shipmentNumber"),
  statusPill: document.getElementById("statusPill"),
  currentStatus: document.getElementById("currentStatus"),
  statusDescription: document.getElementById("statusDescription"),
  lastUpdated: document.getElementById("lastUpdated"),
  carrierName: document.getElementById("carrierName"),
  estimatedDate: document.getElementById("estimatedDate"),
  estimatedWindow: document.getElementById("estimatedWindow"),
  scheduleConfidence: document.getElementById("scheduleConfidence"),
  packageCount: document.getElementById("packageCount"),
  grossWeight: document.getElementById("grossWeight"),
  shippingMode: document.getElementById("shippingMode"),
  originName: document.getElementById("originName"),
  originCode: document.getElementById("originCode"),
  destinationName: document.getElementById("destinationName"),
  destinationCode: document.getElementById("destinationCode"),
  routeDistance: document.getElementById("routeDistance"),
  routeLineComplete: document.getElementById("routeLineComplete"),
  routeVehicle: document.getElementById("routeVehicle"),
  progressValue: document.getElementById("progressValue"),
  progressBar: document.getElementById("progressBar"),
  remainingTime: document.getElementById("remainingTime"),
  timeline: document.getElementById("timeline"),
  expandTimelineButton: document.getElementById("expandTimelineButton"),
  customerReference: document.getElementById("customerReference"),
  bookingNumber: document.getElementById("bookingNumber"),
  containerNumber: document.getElementById("containerNumber"),
  incoterm: document.getElementById("incoterm"),
  documentsGrid: document.getElementById("documentsGrid"),
  copyTrackingButton: document.getElementById("copyTrackingButton"),
  printButton: document.getElementById("printButton"),
  toast: document.getElementById("toast"),
  toastText: document.getElementById("toastText"),
  currentYear: document.getElementById("currentYear")
};

let activeTrackingNumber = "PMEW-EXP-260724";
let toastTimer;

function initializeIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function normalizeTrackingNumber(value) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function renderShipment(trackingNumber) {
  const shipment = shipmentDatabase[trackingNumber];
  if (!shipment) return false;

  activeTrackingNumber = trackingNumber;
  elements.portalSection.hidden = false;
  elements.emptyStateSection.hidden = true;

  elements.shipmentTitle.textContent = shipment.title;
  elements.shipmentNumber.textContent = `Tracking ID: ${trackingNumber}`;
  elements.currentStatus.textContent = shipment.currentStatus;
  elements.statusDescription.textContent = shipment.statusDescription;
  elements.lastUpdated.textContent = shipment.lastUpdated;
  elements.carrierName.textContent = shipment.carrier;
  elements.estimatedDate.textContent = shipment.estimatedDate;
  elements.estimatedWindow.textContent = shipment.estimatedWindow;
  elements.scheduleConfidence.textContent = shipment.scheduleConfidence;
  elements.packageCount.textContent = shipment.packageCount;
  elements.grossWeight.textContent = shipment.grossWeight;
  elements.shippingMode.textContent = shipment.shippingMode;
  elements.originName.textContent = shipment.originName;
  elements.originCode.textContent = shipment.originCode;
  elements.destinationName.textContent = shipment.destinationName;
  elements.destinationCode.textContent = shipment.destinationCode;
  elements.routeDistance.textContent = shipment.routeDistance;
  elements.progressValue.textContent = `${shipment.progress}%`;
  elements.remainingTime.textContent = shipment.remainingTime;
  elements.customerReference.textContent = shipment.customerReference;
  elements.bookingNumber.textContent = shipment.bookingNumber;
  elements.containerNumber.textContent = shipment.containerNumber;
  elements.incoterm.textContent = shipment.incoterm;

  elements.statusPill.className = "status-pill";
  if (shipment.status.toLowerCase() === "delivered") {
    elements.statusPill.classList.add("status-delivered");
  }
  if (shipment.status.toLowerCase().includes("clearance")) {
    elements.statusPill.classList.add("status-exception");
  }

  elements.statusPill.innerHTML = `
    <span class="pulse-dot"></span>
    ${shipment.status.toUpperCase()}
  `;

  elements.routeLineComplete.style.width = `${shipment.progress}%`;
  elements.routeVehicle.style.left = `${shipment.progress}%`;
  elements.progressBar.style.width = `${shipment.progress}%`;
  elements.routeVehicle.innerHTML = `<i data-lucide="${shipment.vehicleIcon}"></i>`;

  renderTimeline(shipment.timeline);
  renderDocuments(shipment.documents);
  initializeIcons();

  return true;
}

function renderTimeline(events) {
  elements.timeline.classList.remove("expanded");
  elements.expandTimelineButton.classList.remove("is-open");
  elements.expandTimelineButton.innerHTML = `
    Show all events
    <i data-lucide="chevron-down"></i>
  `;

  elements.timeline.innerHTML = events
    .map((event, index) => {
      const extraClass = index > 2 ? "is-extra" : "";
      return `
        <article class="timeline-item ${event.state} ${extraClass}">
          <span class="timeline-marker" aria-hidden="true"></span>
          <div class="timeline-content">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
          </div>
          <div class="timeline-time">
            <strong>${event.date}</strong>
            <span>${event.time}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDocuments(documents) {
  elements.documentsGrid.innerHTML = documents
    .map(
      (document) => `
        <article class="document-card" data-document="${document.name}">
          <span class="document-icon">
            <i data-lucide="${document.icon}"></i>
          </span>
          <span class="document-copy">
            <strong>${document.name}</strong>
            <span>${document.type}</span>
          </span>
          <button class="document-download" type="button" aria-label="Download ${document.name}">
            <i data-lucide="download"></i>
          </button>
        </article>
      `
    )
    .join("");
}

function handleTrackingSubmit(event) {
  event.preventDefault();
  const trackingNumber = normalizeTrackingNumber(elements.trackingInput.value);

  if (!trackingNumber) {
    elements.formMessage.textContent = "Enter a tracking number to continue.";
    elements.trackingInput.focus();
    return;
  }

  elements.formMessage.textContent = "";
  elements.portalSection.classList.add("is-loading");

  window.setTimeout(() => {
    elements.portalSection.classList.remove("is-loading");
    const found = renderShipment(trackingNumber);

    if (found) {
      elements.portalSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      elements.portalSection.hidden = true;
      elements.emptyStateSection.hidden = false;
      elements.emptyStateSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      initializeIcons();
    }
  }, 350);
}

function toggleTimeline() {
  const isExpanded = elements.timeline.classList.toggle("expanded");
  elements.expandTimelineButton.classList.toggle("is-open", isExpanded);
  elements.expandTimelineButton.innerHTML = `
    ${isExpanded ? "Show fewer events" : "Show all events"}
    <i data-lucide="chevron-down"></i>
  `;
  initializeIcons();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toastText.textContent = message;
  elements.toast.classList.add("show");

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

async function copyTrackingNumber() {
  try {
    await navigator.clipboard.writeText(activeTrackingNumber);
    showToast("Tracking number copied");
  } catch (error) {
    showToast(activeTrackingNumber);
  }
}


elements.trackingForm.addEventListener("submit", handleTrackingSubmit);

document.querySelectorAll(".demo-id").forEach((button) => {
  button.addEventListener("click", () => {
    elements.trackingInput.value = button.dataset.demoId;
    elements.formMessage.textContent = "";
    elements.trackingForm.requestSubmit();
  });
});

elements.tryAgainButton.addEventListener("click", () => {
  elements.emptyStateSection.hidden = true;
  elements.portalSection.hidden = false;
  document.getElementById("tracking").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
  window.setTimeout(() => elements.trackingInput.focus(), 450);
});

elements.expandTimelineButton.addEventListener("click", toggleTimeline);
elements.copyTrackingButton.addEventListener("click", copyTrackingNumber);
elements.printButton.addEventListener("click", () => window.print());

elements.documentsGrid.addEventListener("click", (event) => {
  const documentCard = event.target.closest(".document-card");
  if (!documentCard) return;
  showToast(`${documentCard.dataset.document} is ready for API connection`);
});


elements.currentYear.textContent = new Date().getFullYear();
elements.trackingInput.value = activeTrackingNumber;
renderShipment(activeTrackingNumber);
initializeIcons();
