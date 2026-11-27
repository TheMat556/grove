/**
 * Event, mit dem ein bereits gerenderter Anlegen-Dialog geöffnet wird. Nötig,
 * wenn das Plus-Menü auf der eigenen Seite klickt: reine Link-Navigation
 * wechselt dann nur den Query-String, der Dialog wird nicht neu gemountet.
 */
export const NEU_DIALOG_EVENT = "grove:neu-dialog";
