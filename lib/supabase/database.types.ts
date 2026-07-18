export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "14.5";
	};
	public: {
		Tables: {
			tb_einsatz: {
				Row: {
					bis: string | null;
					id: string;
					profil_id: string;
					saison_id: string;
					stand_id: string;
					von: string;
				};
				Insert: {
					bis?: string | null;
					id?: string;
					profil_id: string;
					saison_id: string;
					stand_id: string;
					von: string;
				};
				Update: {
					bis?: string | null;
					id?: string;
					profil_id?: string;
					saison_id?: string;
					stand_id?: string;
					von?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_einsatz_profil_id_fkey";
						columns: ["profil_id"];
						isOneToOne: false;
						referencedRelation: "tb_profil";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_einsatz_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_einsatz_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_inventur: {
				Row: {
					datum: string;
					differenz: number;
					grund: string | null;
					id: string;
					produkt_id: string;
					profil_id: string;
					saison_id: string;
					stand_id: string;
				};
				Insert: {
					datum: string;
					differenz: number;
					grund?: string | null;
					id?: string;
					produkt_id: string;
					profil_id: string;
					saison_id: string;
					stand_id: string;
				};
				Update: {
					datum?: string;
					differenz?: number;
					grund?: string | null;
					id?: string;
					produkt_id?: string;
					profil_id?: string;
					saison_id?: string;
					stand_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_inventur_produkt_id_fkey";
						columns: ["produkt_id"];
						isOneToOne: false;
						referencedRelation: "tb_produkt";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_inventur_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_inventur_profil_id_fkey";
						columns: ["profil_id"];
						isOneToOne: false;
						referencedRelation: "tb_profil";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_inventur_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_kunde: {
				Row: {
					adresse: string;
					id: string;
					ist_firma: boolean;
					name: string;
					telefon: string;
				};
				Insert: {
					adresse: string;
					id?: string;
					ist_firma: boolean;
					name: string;
					telefon: string;
				};
				Update: {
					adresse?: string;
					id?: string;
					ist_firma?: boolean;
					name?: string;
					telefon?: string;
				};
				Relationships: [];
			};
			tb_position: {
				Row: {
					einzelpreis: number;
					hoehe_cm: number;
					id: string;
					kreuz_montiert: boolean;
					menge: number;
					produkt_id: string;
					verkauf_id: string;
				};
				Insert: {
					einzelpreis: number;
					hoehe_cm: number;
					id?: string;
					kreuz_montiert?: boolean;
					menge: number;
					produkt_id: string;
					verkauf_id: string;
				};
				Update: {
					einzelpreis?: number;
					hoehe_cm?: number;
					id?: string;
					kreuz_montiert?: boolean;
					menge?: number;
					produkt_id?: string;
					verkauf_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_position_produkt_id_fkey";
						columns: ["produkt_id"];
						isOneToOne: false;
						referencedRelation: "tb_produkt";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_position_verkauf_id_fkey";
						columns: ["verkauf_id"];
						isOneToOne: false;
						referencedRelation: "tb_verkauf";
						referencedColumns: ["id"];
					},
				];
			};
			tb_preisempfehlung: {
				Row: {
					id: string;
					preis: number;
					produkt_id: string;
					saison_id: string;
				};
				Insert: {
					id?: string;
					preis: number;
					produkt_id: string;
					saison_id: string;
				};
				Update: {
					id?: string;
					preis?: number;
					produkt_id?: string;
					saison_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_preisempfehlung_produkt_id_fkey";
						columns: ["produkt_id"];
						isOneToOne: false;
						referencedRelation: "tb_produkt";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_preisempfehlung_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
				];
			};
			tb_produkt: {
				Row: {
					art: string;
					bezeichnung: string;
					bis_cm: number;
					id: string;
					von_cm: number;
				};
				Insert: {
					art?: string;
					bezeichnung: string;
					bis_cm: number;
					id?: string;
					von_cm: number;
				};
				Update: {
					art?: string;
					bezeichnung?: string;
					bis_cm?: number;
					id?: string;
					von_cm?: number;
				};
				Relationships: [];
			};
			tb_profil: {
				Row: {
					aktiv: boolean;
					erstellt_am: string;
					id: string;
					name: string;
					rolle: string;
					telefon: string | null;
				};
				Insert: {
					aktiv?: boolean;
					erstellt_am?: string;
					id: string;
					name: string;
					rolle?: string;
					telefon?: string | null;
				};
				Update: {
					aktiv?: boolean;
					erstellt_am?: string;
					id?: string;
					name?: string;
					rolle?: string;
					telefon?: string | null;
				};
				Relationships: [];
			};
			tb_reservierung: {
				Row: {
					anzahlungsbetrag: number | null;
					geplantes_datum: string;
					id: string;
					kunde_id: string;
					profil_id: string;
					reserviert_am: string;
					saison_id: string;
					stand_id: string;
					status: string;
					versandart: string;
				};
				Insert: {
					anzahlungsbetrag?: number | null;
					geplantes_datum: string;
					id?: string;
					kunde_id: string;
					profil_id: string;
					reserviert_am?: string;
					saison_id: string;
					stand_id: string;
					status?: string;
					versandart?: string;
				};
				Update: {
					anzahlungsbetrag?: number | null;
					geplantes_datum?: string;
					id?: string;
					kunde_id?: string;
					profil_id?: string;
					reserviert_am?: string;
					saison_id?: string;
					stand_id?: string;
					status?: string;
					versandart?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_reservierung_kunde_id_fkey";
						columns: ["kunde_id"];
						isOneToOne: false;
						referencedRelation: "tb_kunde";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_reservierung_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_reservierung_profil_id_fkey";
						columns: ["profil_id"];
						isOneToOne: false;
						referencedRelation: "tb_profil";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_reservierung_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_saison: {
				Row: {
					active: boolean;
					end_datum: string;
					id: string;
					name: string;
					start_datum: string;
				};
				Insert: {
					active?: boolean;
					end_datum: string;
					id?: string;
					name: string;
					start_datum: string;
				};
				Update: {
					active?: boolean;
					end_datum?: string;
					id?: string;
					name?: string;
					start_datum?: string;
				};
				Relationships: [];
			};
			tb_stand: {
				Row: {
					bezeichnung: string;
					id: string;
					standort_id: string;
				};
				Insert: {
					bezeichnung: string;
					id?: string;
					standort_id: string;
				};
				Update: {
					bezeichnung?: string;
					id?: string;
					standort_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_stand_standort_id_fkey";
						columns: ["standort_id"];
						isOneToOne: false;
						referencedRelation: "tb_standort";
						referencedColumns: ["id"];
					},
				];
			};
			tb_stand_saison: {
				Row: {
					saison_id: string;
					stand_id: string;
				};
				Insert: {
					saison_id: string;
					stand_id: string;
				};
				Update: {
					saison_id?: string;
					stand_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_stand_saison_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_stand_saison_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_standort: {
				Row: {
					adresse: string;
					id: string;
					ort: string;
					plz: number;
				};
				Insert: {
					adresse: string;
					id?: string;
					ort: string;
					plz: number;
				};
				Update: {
					adresse?: string;
					id?: string;
					ort?: string;
					plz?: number;
				};
				Relationships: [];
			};
			tb_verkauf: {
				Row: {
					aktion_bz: string | null;
					anmerkung: string | null;
					id: string;
					preis_gesamt: number;
					profil_id: string;
					reservierung_id: string | null;
					saison_id: string;
					stand_id: string;
					verkauft_am: string;
				};
				Insert: {
					aktion_bz?: string | null;
					anmerkung?: string | null;
					id?: string;
					preis_gesamt: number;
					profil_id: string;
					reservierung_id?: string | null;
					saison_id: string;
					stand_id: string;
					verkauft_am?: string;
				};
				Update: {
					aktion_bz?: string | null;
					anmerkung?: string | null;
					id?: string;
					preis_gesamt?: number;
					profil_id?: string;
					reservierung_id?: string | null;
					saison_id?: string;
					stand_id?: string;
					verkauft_am?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_verkauf_profil_id_fkey";
						columns: ["profil_id"];
						isOneToOne: false;
						referencedRelation: "tb_profil";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_verkauf_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_verkauf_reservierung_id_fkey";
						columns: ["reservierung_id"];
						isOneToOne: false;
						referencedRelation: "tb_reservierung";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_verkauf_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_wareneingang: {
				Row: {
					datum: string;
					erfasst_von: string;
					id: string;
					saison_id: string;
					stand_id: string;
				};
				Insert: {
					datum?: string;
					erfasst_von: string;
					id?: string;
					saison_id: string;
					stand_id: string;
				};
				Update: {
					datum?: string;
					erfasst_von?: string;
					id?: string;
					saison_id?: string;
					stand_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_wareneingang_erfasst_von_fkey";
						columns: ["erfasst_von"];
						isOneToOne: false;
						referencedRelation: "tb_profil";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_wareneingang_saison_id_fkey";
						columns: ["saison_id"];
						isOneToOne: false;
						referencedRelation: "tb_saison";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_wareneingang_stand_id_fkey";
						columns: ["stand_id"];
						isOneToOne: false;
						referencedRelation: "tb_stand";
						referencedColumns: ["id"];
					},
				];
			};
			tb_wareneingangsposition: {
				Row: {
					id: string;
					menge: number;
					produkt_id: string;
					wareneingang_id: string;
				};
				Insert: {
					id?: string;
					menge: number;
					produkt_id: string;
					wareneingang_id: string;
				};
				Update: {
					id?: string;
					menge?: number;
					produkt_id?: string;
					wareneingang_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tb_wareneingangsposition_produkt_id_fkey";
						columns: ["produkt_id"];
						isOneToOne: false;
						referencedRelation: "tb_produkt";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tb_wareneingangsposition_wareneingang_id_fkey";
						columns: ["wareneingang_id"];
						isOneToOne: false;
						referencedRelation: "tb_wareneingang";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			create_verkauf_mit_positionen: {
				Args: {
					p_verkauf: Json;
					p_positionen: Json;
				};
				Returns: Tables<"tb_verkauf">;
			};
			create_wareneingang_mit_positionen: {
				Args: {
					p_wareneingang: Json;
					p_positionen: Json;
				};
				Returns: Tables<"tb_wareneingang">;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
