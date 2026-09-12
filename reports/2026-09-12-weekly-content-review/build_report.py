from pathlib import Path
import json
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Image, KeepTogether, HRFlowable
)

ROOT = Path(__file__).parent
OUT = ROOT / "Rapport_weekly_Stepers_2026-09-12.pdf"
CHART_KPI = ROOT / "kpi_comparison.png"
CHART_TOP = ROOT / "top_posts.png"
CHART_DAILY = ROOT / "daily_funnel.png"

NAVY = colors.HexColor("#101828")
BLUE = colors.HexColor("#2563EB")
CYAN = colors.HexColor("#06B6D4")
GREEN = colors.HexColor("#16A34A")
RED = colors.HexColor("#DC2626")
AMBER = colors.HexColor("#D97706")
LIGHT = colors.HexColor("#F3F6FA")
MID = colors.HexColor("#667085")
BORDER = colors.HexColor("#D0D5DD")
WHITE = colors.white

font_dir = Path("C:/Windows/Fonts")
regular = font_dir / "arial.ttf"
bold = font_dir / "arialbd.ttf"
if regular.exists() and bold.exists():
    pdfmetrics.registerFont(TTFont("Report", str(regular)))
    pdfmetrics.registerFont(TTFont("Report-Bold", str(bold)))
    FONT, FONT_BOLD = "Report", "Report-Bold"
else:
    FONT, FONT_BOLD = "Helvetica", "Helvetica-Bold"

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})

def save_charts():
    # KPI comparison
    fig, axes = plt.subplots(1, 3, figsize=(10.5, 3.1))
    current = [13, 1, 7.69]
    previous = [33, 0, 0]
    titles = ["Visiteurs LP", "Inscriptions", "Conversion (%)"]
    for ax, title, prev, cur in zip(axes, titles, previous, current):
        bars = ax.bar([0, 1], [prev, cur], color=["#CBD5E1", "#2563EB"], width=.62)
        ax.set_title(title, fontsize=11, fontweight="bold", color="#101828")
        ax.set_xticks([0, 1], ["N-1", "N"])
        ax.spines[["top", "right", "left"]].set_visible(False)
        ax.grid(axis="y", alpha=.14)
        ax.tick_params(axis="y", left=False, labelleft=False)
        for b, v in zip(bars, [prev, cur]):
            label = f"{v:.1f}" if isinstance(v, float) else str(v)
            ax.text(b.get_x()+b.get_width()/2, b.get_height()+max(cur, prev, 1)*.04, label,
                    ha="center", va="bottom", fontweight="bold", color="#101828")
        ax.set_ylim(0, max(cur, prev, 1)*1.25)
    fig.suptitle("Funnel production — www.stepers.io", x=.02, ha="left", fontsize=12, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, .9])
    fig.savefig(CHART_KPI, dpi=180, bbox_inches="tight", transparent=False, facecolor="white")
    plt.close(fig)

    # Top posts
    labels = ["#connect / networking", "Démo LP / hype", "Resend = dette email", "Lifecycle = rétention", "Réflexion fin d'année"]
    values = [2380, 398, 187, 187, 185]
    fig, ax = plt.subplots(figsize=(9.2, 3.25))
    y = list(range(len(labels)))
    ax.barh(y, values, color=["#06B6D4", "#2563EB", "#2563EB", "#2563EB", "#94A3B8"])
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.spines[["top", "right", "left", "bottom"]].set_visible(False)
    ax.tick_params(axis="x", bottom=False, labelbottom=False)
    ax.grid(False)
    for i, v in enumerate(values):
        ax.text(v + 28, i, f"{v:,}".replace(",", " "), va="center", fontweight="bold", color="#101828")
    ax.set_xlim(0, 2700)
    ax.set_title("Top 5 — impressions cumulées au 12 septembre", loc="left", fontsize=12, fontweight="bold")
    fig.tight_layout()
    fig.savefig(CHART_TOP, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close(fig)

    # Daily production visitors and conversion
    dates = ["30/8","31/8","1/9","2/9","3/9","4/9","5/9","6/9","7/9","8/9","9/9","10/9","11/9","12/9*"]
    visitors = [3,9,5,11,1,2,2,2,3,2,1,3,1,3]
    joins = [0,0,0,0,0,0,0,0,1,0,0,0,0,0]
    fig, ax = plt.subplots(figsize=(10.2, 3.4))
    ax.plot(dates, visitors, marker="o", linewidth=2.2, color="#2563EB", label="Visiteurs uniques")
    ax.scatter([i for i,v in enumerate(joins) if v], [visitors[i] for i,v in enumerate(joins) if v],
               s=120, color="#16A34A", edgecolor="white", linewidth=1.5, zorder=5, label="1 inscription")
    ax.axvspan(6.5, 13.5, color="#2563EB", alpha=.06)
    ax.text(7, 10.5, "Période N", color="#2563EB", fontweight="bold")
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=.16)
    ax.set_ylim(0, 12)
    ax.legend(frameon=False, loc="upper right")
    ax.set_title("Visiteurs LP quotidiens — production uniquement (UTC)", loc="left", fontsize=12, fontweight="bold")
    fig.tight_layout()
    fig.savefig(CHART_DAILY, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close(fig)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleX", fontName=FONT_BOLD, fontSize=25, leading=29, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name="Sub", fontName=FONT, fontSize=10, leading=14, textColor=MID))
styles.add(ParagraphStyle(name="H1X", fontName=FONT_BOLD, fontSize=16, leading=20, textColor=NAVY, spaceBefore=5, spaceAfter=9))
styles.add(ParagraphStyle(name="H2X", fontName=FONT_BOLD, fontSize=11.5, leading=15, textColor=NAVY, spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyX", fontName=FONT, fontSize=9.4, leading=13.4, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name="SmallX", fontName=FONT, fontSize=7.6, leading=10.4, textColor=MID))
styles.add(ParagraphStyle(name="CalloutX", fontName=FONT_BOLD, fontSize=11.5, leading=16, textColor=WHITE))
styles.add(ParagraphStyle(name="KpiNumber", fontName=FONT_BOLD, fontSize=20, leading=22, textColor=NAVY, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="KpiLabel", fontName=FONT, fontSize=7.6, leading=10, textColor=MID, alignment=TA_CENTER))

P = lambda text, style="BodyX": Paragraph(text, styles[style])

def bullet(text, color=BLUE):
    return Table([["", P(text)]], colWidths=[3*mm, 169*mm], style=TableStyle([
        ("BACKGROUND", (0,0), (0,0), color), ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (0,0), 0), ("RIGHTPADDING", (0,0), (0,0), 0),
        ("TOPPADDING", (0,0), (0,0), 3), ("BOTTOMPADDING", (0,0), (0,0), 3),
        ("LEFTPADDING", (1,0), (1,0), 7), ("RIGHTPADDING", (1,0), (1,0), 0),
    ]))

def kpi_card(number, label, color=BLUE):
    t = Table([[P(number, "KpiNumber")], [P(label, "KpiLabel")]], colWidths=[39*mm], rowHeights=[12*mm, 11*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT), ("BOX", (0,0), (-1,-1), .6, BORDER),
        ("LINEABOVE", (0,0), (-1,0), 3, color), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 4), ("RIGHTPADDING", (0,0), (-1,-1), 4),
    ]))
    return t

def section_title(num, title):
    return P(f"{num}. {title}", "H1X")

def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(.4)
    canvas.line(20*mm, 13*mm, w-20*mm, 13*mm)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MID)
    canvas.drawString(20*mm, 8.2*mm, "STEPERS — Weekly Content Review")
    canvas.drawRightString(w-20*mm, 8.2*mm, f"{doc.page}")
    canvas.restoreState()

def build():
    save_charts()
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm,
                            topMargin=17*mm, bottomMargin=18*mm,
                            title="Weekly Content Review — Stepers — 12 septembre 2026",
                            author="Hermes — CMO de Stepers")
    story = []
    story += [P("WEEKLY CONTENT REVIEW", "Sub"), P("De la visibilité à la waitlist", "TitleX"),
              P("Période N : 6–12 septembre 2026, arrêtée le 12 à 14:18 (Paris) • Comparaison : 30 août–5 septembre", "Sub"),
              Spacer(1, 7*mm)]
    call = Table([[P("Verdict : la portée X monte, mais elle ne produit pas assez de trafic qualifié. Le seul vrai signal positif est la première inscription de la semaine.", "CalloutX")]], colWidths=[174*mm])
    call.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)]))
    story += [call, Spacer(1, 6*mm), section_title("1", "TL;DR")]
    story += [bullet("<b>13 visiteurs LP</b>, contre 33 : <font color='#DC2626'><b>-61%</b></font>. Organic Social recule de 9 à 6 visiteurs."),
              bullet("<b>1 inscription</b> et <b>7,7% de conversion</b>. C'est mieux que 0, mais l'échantillon (13 visiteurs) est trop faible pour conclure que la LP est validée.", GREEN),
              bullet("X affiche <b>4 896 impressions (+46%)</b>, mais le post #connect pèse 49% du total et 74% des visites de profil. Sans lui : <b>2 516 impressions (-25%)</b> vs N-1."),
              bullet("Priorité n°1 : publier chaque jour un contenu <b>douleur ICP → preuve → CTA direct tracké</b>, pas davantage de posts génériques.", AMBER),
              Spacer(1, 7*mm)]
    story.append(Table([[kpi_card("13", "visiteurs LP\n-61%"), kpi_card("1", "nouvelle inscription", GREEN), kpi_card("7,7%", "conversion\n(n=13)", GREEN), kpi_card("2 / 100", "objectif waitlist\n98 restantes", AMBER)]], colWidths=[43.5*mm]*4, style=TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),2),("RIGHTPADDING",(0,0),(-1,-1),2)])))
    story += [Spacer(1, 7*mm), P("La recommandation de la semaine", "H2X"),
              P("Arrête de traiter la bio comme un funnel. Mets le lien www.stepers.io dans les posts d'intention forte, avec un UTM propre, et promets un résultat concret : centraliser et améliorer le système email d'un SaaS déjà en revenu."),
              Spacer(1, 3*mm), P("Périmètre : www.stepers.io uniquement. L'ancien domaine sparkly-livid.vercel.app est exclu de toutes les données PostHog.", "SmallX")]

    story += [PageBreak(), section_title("2", "Les KPIs"), Image(str(CHART_KPI), width=172*mm, height=51*mm), Spacer(1, 4*mm)]
    table_data = [[P("KPI", "H2X"), P("N", "H2X"), P("N-1", "H2X"), P("Tendance", "H2X"), P("Lecture", "H2X")],
                  [P("Trafic LP"), P("13"), P("33"), P("<font color='#DC2626'><b>↓ 61%</b></font>"), P("Le problème principal reste l'acquisition.")],
                  [P("Inscriptions"), P("1"), P("0"), P("<font color='#16A34A'><b>↑ +1</b></font>"), P("Signal positif, pas encore un pattern.")],
                  [P("Conversion"), P("7,7%"), P("0%"), P("<font color='#16A34A'><b>↑ 7,7 pts</b></font>"), P("Très instable à n=13.")],
                  [P("Impressions X"), P("4 896"), P("3 364"), P("<font color='#16A34A'><b>↑ 46%</b></font>"), P("Trompeur : un outlier fait la moitié.")],
                  [P("Posts standalone"), P("22"), P("16"), P("<font color='#16A34A'><b>↑ 38%</b></font>"), P("Plus de volume, médiane plus faible.")],
                  [P("Médiane / post"), P("109"), P("141"), P("<font color='#DC2626'><b>↓ 23%</b></font>"), P("La qualité moyenne de distribution recule.")],
                  [P("Visites profil X"), P("108"), P("50"), P("<font color='#16A34A'><b>↑ 116%</b></font>"), P("79 viennent du post #connect.")],
                  [P("Followers"), P("457"), P("—"), P("="), P("Pas de snapshot N-1 fiable.")]]
    kt = Table(table_data, colWidths=[34*mm,18*mm,18*mm,25*mm,77*mm], repeatRows=1)
    kt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.4,BORDER),("VALIGN",(0,0),(-1,-1),"TOP"),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT]),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [kt, Spacer(1, 5*mm), P("Objectif waitlist", "H2X"), bullet("<b>2 inscriptions uniques cumulées sur la production</b>, soit 2% de l'objectif de 100. Il en reste 98."),
              bullet("Le catalogue de métriques gouvernées PostHog a été consulté : aucun KPI canonique n'existe. Les définitions utilisées sont donc explicites mais non canoniques."),
              Spacer(1, 3*mm), P("Caveat : N est une semaine partielle au moment de la collecte. Les métriques X sont des snapshots cumulés, donc les posts les plus récents ont eu moins de temps pour distribuer.", "SmallX")]

    story += [PageBreak(), section_title("3", "Ce qui a marché / ce qui n'a pas marché"), Image(str(CHART_TOP), width=172*mm, height=61*mm), Spacer(1, 2*mm), P("Ce qui a marché", "H2X")]
    story += [bullet("<b>#connect / networking</b> — 2 380 impressions, 393 engagements, 79 visites profil. Excellent pour élargir le réseau ; faible preuve d'intention d'achat." , CYAN),
              bullet("<b>Démo LP / hype Stepers</b> — 398 impressions, mais seulement 1 visite profil. La curiosité existe ; la proposition reste trop vague pour pousser à l'action."),
              bullet("<b>Critique de Resend</b> — 187 impressions, 23 engagements, 5 visites profil. C'est le meilleur signal qualifié : ICP clair, douleur concrète, point de vue tranché."),
              bullet("<b>Lifecycle = rétention</b> — 187 impressions, 25 engagements. L'angle business est bon, mais sans CTA ni preuve, il nourrit surtout l'éducation."),
              Spacer(1, 3*mm), P("Ce qui n'a pas marché", "H2X"),
              bullet("<b>Agent Hermes pour la distribution</b> — 90 impressions, 6 engagements, 1 visite profil. L'outil attire des builders, mais détourne du problème email / waitlist." , RED),
              bullet("<b>« The more you give »</b> — 44 impressions. Angle générique, aucune tension ICP, aucune passerelle vers Stepers.", RED),
              bullet("<b>« Mentally obese / take action »</b> — 55 impressions, 1 engagement. One-liner interchangeable, sans preuve personnelle.", RED),
              bullet("Le CTA direct vers Stepers placé en <b>réponse de thread</b> n'a obtenu que 16 impressions et 0 clic mesuré. Le CTA a été enterré." , RED),
              Spacer(1, 3*mm), P("Patterns", "H2X"),
              bullet("Le volume monte (+38%), mais la médiane tombe de 141 à 109 impressions. <b>Publier plus n'a pas amélioré la distribution typique.</b>"),
              bullet("Les 10 posts liés à Stepers / au problème ICP font 1 541 impressions, soit 154 par post, contre 196 pour les 7 posts comparables de N-1 (-22%)."),
              bullet("Les meilleurs signaux qualifiés combinent : cible explicite (« SaaS qui fait du MRR »), ennemi concret (Resend + logique dispersée) et conséquence business."),
              bullet("La semaine précédente, l'histoire personnelle « mon premier revenu grâce à un email » faisait 324 impressions et 73 engagements. <b>Preuve vécue > explication abstraite.</b>", GREEN)]

    story += [PageBreak(), section_title("4", "Corrélation avec le funnel"), Image(str(CHART_DAILY), width=172*mm, height=57*mm), Spacer(1, 4*mm)]
    story += [bullet("<b>Fait :</b> la production enregistre 13 visiteurs, dont 6 via Organic Social, et 1 inscription. Le funnel $pageview → waitlist_joined donne 7,69% et 9 s de conversion."),
              bullet("<b>Fait :</b> le trafic social passe de 9 à 6 visiteurs (-33%) malgré la hausse apparente des impressions X."),
              bullet("<b>Hypothèse :</b> le post #connect a probablement généré des visites de profil peu qualifiées. Les 79 visites profil ne se traduisent pas en hausse LP." , AMBER),
              bullet("<b>Hypothèse :</b> l'inscription du 7 septembre peut être liée aux posts « email sequences / SaaS MRR » et « priorité solo founder » publiés ce jour-là. Impossible de l'attribuer sans UTM ou clic individuel." , AMBER),
              bullet("<b>Conclusion :</b> cette semaine valide seulement qu'une conversion est possible. Elle ne valide ni le message de la LP, ni un canal de contenu précis."),
              Spacer(1, 4*mm), P("Sources de trafic", "H2X")]
    src = Table([[P("Canal", "H2X"),P("N", "H2X"),P("N-1", "H2X"),P("Écart", "H2X")],
                 [P("Direct"),P("6"),P("23"),P("-74%")],[P("Organic Social"),P("6"),P("9"),P("-33%")],[P("Organic Search"),P("1"),P("1"),P("=")]], colWidths=[65*mm,30*mm,30*mm,30*mm])
    src.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.4,BORDER),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT]),("ALIGN",(1,1),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [src, Spacer(1, 4*mm), P("Device actuel : 8 visiteurs desktop, 5 mobile. Échantillon trop faible pour conclure à un problème mobile.", "SmallX")]

    story += [PageBreak(), section_title("5", "Recommandations pour la semaine prochaine")]
    recs = [
        ("1", "Un post d'intention forte par jour", "Cible : SaaS founder avec utilisateurs / MRR. Structure : douleur observée → coût business → preuve personnelle ou capture produit → Stepers → lien direct tracké. 5 posts sur la semaine, pas 15 variations génériques."),
        ("2", "Mettre le CTA dans le post", "Lien www.stepers.io visible, avec UTM par post (utm_source=x, utm_medium=organic, utm_campaign=weekly_test, utm_content=<id>). Ne plus enterrer le lien dans une réponse."),
        ("3", "Transformer la preuve en contenu", "Publier la démo annoncée : montrer un email dispersé dans le code, puis la même logique visible dans Stepers. Une preuve produit concrète vaut plus que « this project is going to be insane »."),
        ("4", "Garder le networking, mais le séparer", "Maximum 1 post #connect. Son rôle est la croissance d'audience, pas la conversion. Ne pas le compter comme validation du message Stepers."),
    ]
    for n,t,b in recs:
        box = Table([[P(n, "KpiNumber"), P(f"<b>{t}</b><br/>{b}")]], colWidths=[17*mm,154*mm])
        box.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),.6,BORDER),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
        story += [box, Spacer(1, 3*mm)]
    story += [Spacer(1, 2*mm), P("Hypothèse à tester", "H2X"),
              bullet("Un post « douleur ICP + preuve produit + CTA tracké » générera <b>au moins 3 visites LP qualifiées</b> et au moins <b>1 inscription</b> sur 7 jours. Critère secondaire : taux clic lien / impressions supérieur à 1%." , AMBER),
              P("Charge réaliste : 45–60 min/jour pour le post, 15 min pour répondre, 30 min vendredi pour lire les UTM et décider quoi répéter.", "SmallX"),
              Spacer(1, 6*mm), section_title("6", "Ce que je te dis franchement"),
              bullet("Tu as créé de la portée, pas encore un moteur d'acquisition. <b>4 896 impressions pour 13 visiteurs</b>, ce n'est pas une victoire de funnel." , RED),
              bullet("Ton meilleur post est un post de networking, pas un post qui vend Stepers. Si tu optimises les impressions, tu vas apprendre à attirer des builders — pas forcément des acheteurs." , RED),
              bullet("Tu promets une démo et un article email. Maintenant il faut livrer. Sans preuve visible, le positionnement reste une opinion répétée." , RED),
              Spacer(1, 7*mm), HRFlowable(width="100%", thickness=.6, color=BORDER), Spacer(1, 3*mm),
              P("Décision proposée : la semaine prochaine, mesure les clics par post avec UTM et juge chaque format sur visites LP + inscriptions, pas sur impressions.", "H2X"),
              P("Sources : X Analytics (posts standalone, métriques cumulées observées le 12/09/2026) ; PostHog, projet production filtré sur $host = www.stepers.io. Domaine sparkly-livid.vercel.app exclu. Les liens causaux sont explicitement présentés comme hypothèses.", "SmallX")]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUT)

if __name__ == "__main__":
    build()
