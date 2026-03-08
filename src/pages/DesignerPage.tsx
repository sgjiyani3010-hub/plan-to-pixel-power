import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, ImagePlus, Palette, Download, RotateCcw, Bold, Italic, AlignCenter, AlignLeft, AlignRight, Minus, Plus, Layers, Move } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

const TSHIRT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#1A1A2E' },
  { name: 'Navy', value: '#0F3460' },
  { name: 'Red', value: '#E94560' },
  { name: 'Forest', value: '#2D6A4F' },
  { name: 'Mustard', value: '#F5A623' },
  { name: 'Charcoal', value: '#4A4A5A' },
  { name: 'Sky', value: '#87CEEB' },
];

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Verdana', 'Trebuchet MS'];

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

interface ImageLayer {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PRINT_POSITIONS = [
  { id: 'front-center', label: 'Front Center', desc: 'Standard chest print' },
  { id: 'front-left', label: 'Front Left', desc: 'Left chest pocket area' },
  { id: 'back-center', label: 'Back Center', desc: 'Full back print' },
  { id: 'back-top', label: 'Back Top', desc: 'Upper back below neck' },
];

const DesignerPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tshirtColor, setTshirtColor] = useState('#FFFFFF');
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [newText, setNewText] = useState('Your Text');
  const [textColor, setTextColor] = useState('#1A1A2E');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [dragging, setDragging] = useState<{ id: string; type: 'text' | 'image'; offsetX: number; offsetY: number } | null>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [printPosition, setPrintPosition] = useState('front-center');

  const { addToCart } = useStore();

  const CANVAS_W = 400;
  const CANVAS_H = 480;
  const PRINT_AREA = { x: 100, y: 80, w: 200, h: 260 };

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // T-shirt shape
    ctx.fillStyle = tshirtColor;
    ctx.beginPath();
    // Simplified T-shirt outline
    ctx.moveTo(80, 0);
    ctx.lineTo(140, 0);
    ctx.lineTo(120, 60);
    ctx.lineTo(160, 60);
    ctx.lineTo(200, 0);
    ctx.lineTo(320, 0);
    ctx.lineTo(320, 60);
    ctx.lineTo(280, 60);
    ctx.lineTo(260, 0);
    ctx.lineTo(320, 0);

    // Simpler approach: draw a t-shirt silhouette
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = tshirtColor;
    ctx.beginPath();
    ctx.moveTo(120, 10);
    ctx.lineTo(150, 10);
    ctx.quadraticCurveTo(165, 10, 170, 50);
    ctx.lineTo(200, 50);
    ctx.quadraticCurveTo(205, 10, 250, 10);
    ctx.lineTo(280, 10);
    ctx.lineTo(340, 70);
    ctx.lineTo(310, 100);
    ctx.lineTo(300, 90);
    ctx.lineTo(300, 460);
    ctx.lineTo(100, 460);
    ctx.lineTo(100, 90);
    ctx.lineTo(90, 100);
    ctx.lineTo(60, 70);
    ctx.closePath();
    ctx.fill();

    // T-shirt border
    ctx.strokeStyle = tshirtColor === '#FFFFFF' ? '#E0E0E0' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Print area guide (dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = tshirtColor === '#FFFFFF' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.w, PRINT_AREA.h);
    ctx.setLineDash([]);

    // Draw image layers
    imageLayers.forEach((layer) => {
      const img = new Image();
      img.src = layer.src;
      img.onload = () => {
        ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        // Redraw text on top after images load
        drawTextLayers(ctx);
      };
      if (img.complete) {
        ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      }
    });

    // Draw text layers
    drawTextLayers(ctx);
  }, [tshirtColor, textLayers, imageLayers]);

  const drawTextLayers = (ctx: CanvasRenderingContext2D) => {
    textLayers.forEach((layer) => {
      const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
      ctx.font = fontStyle;
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align;
      const xPos = layer.align === 'center' ? layer.x + PRINT_AREA.w / 2 :
                   layer.align === 'right' ? layer.x + PRINT_AREA.w : layer.x;
      ctx.fillText(layer.text, xPos, layer.y + layer.fontSize);
    });
  };

  const addText = () => {
    const layer: TextLayer = {
      id: Date.now().toString(),
      text: newText,
      x: PRINT_AREA.x,
      y: PRINT_AREA.y + 40 + textLayers.length * 50,
      fontSize, color: textColor, fontFamily, bold, italic, align: textAlign,
    };
    setTextLayers((prev) => [...prev, layer]);
    setActiveTextId(layer.id);
    toast.success('Text added to design');
  };

  const updateActiveText = (updates: Partial<TextLayer>) => {
    if (!activeTextId) return;
    setTextLayers((prev) => prev.map((l) => l.id === activeTextId ? { ...l, ...updates } : l));
  };

  const removeActiveText = () => {
    if (!activeTextId) return;
    setTextLayers((prev) => prev.filter((l) => l.id !== activeTextId));
    setActiveTextId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const layer: ImageLayer = {
        id: Date.now().toString(),
        src, x: PRINT_AREA.x + 30, y: PRINT_AREA.y + 30, width: 140, height: 140,
      };
      setImageLayers((prev) => [...prev, layer]);
      toast.success('Image added to design');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check text layers (reverse for top-most first)
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const l = textLayers[i];
      if (mx >= l.x && mx <= l.x + PRINT_AREA.w && my >= l.y && my <= l.y + l.fontSize + 10) {
        setDragging({ id: l.id, type: 'text', offsetX: mx - l.x, offsetY: my - l.y });
        setActiveTextId(l.id);
        return;
      }
    }
    // Check image layers
    for (let i = imageLayers.length - 1; i >= 0; i--) {
      const l = imageLayers[i];
      if (mx >= l.x && mx <= l.x + l.width && my >= l.y && my <= l.y + l.height) {
        setDragging({ id: l.id, type: 'image', offsetX: mx - l.x, offsetY: my - l.y });
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nx = mx - dragging.offsetX;
    const ny = my - dragging.offsetY;

    if (dragging.type === 'text') {
      setTextLayers((prev) => prev.map((l) => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
    } else {
      setImageLayers((prev) => prev.map((l) => l.id === dragging.id ? { ...l, x: nx, y: ny } : l));
    }
  };

  const handleCanvasMouseUp = () => setDragging(null);

  const handleReset = () => {
    setTextLayers([]);
    setImageLayers([]);
    setActiveTextId(null);
    setTshirtColor('#FFFFFF');
    toast.info('Design reset');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-custom-tshirt.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Design downloaded!');
  };

  const handleAddToCart = () => {
    const positionLabel = PRINT_POSITIONS.find(p => p.id === printPosition)?.label || 'Front Center';
    addToCart({
      product: {
        id: `custom-${Date.now()}`,
        name: `Custom T-Shirt (${positionLabel})`,
        price: 799,
        image: canvasRef.current?.toDataURL() || '/assets/product-1.jpg',
        category: 'custom',
        colors: [tshirtColor],
        sizes: SIZES,
        description: `Custom designed t-shirt with ${positionLabel.toLowerCase()} print`,
      },
      quantity: 1,
      size: selectedSize,
      color: tshirtColor,
    });
    toast.success(`Custom t-shirt (Size ${selectedSize}) added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">T-Shirt Designer</h1>
            <p className="font-body text-muted-foreground mb-8">Create your own custom t-shirt with text and images</p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
            {/* Controls */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Tabs defaultValue="color" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="color" className="gap-2 font-accent text-xs"><Palette className="w-4 h-4" /> Color</TabsTrigger>
                  <TabsTrigger value="text" className="gap-2 font-accent text-xs"><Type className="w-4 h-4" /> Text</TabsTrigger>
                  <TabsTrigger value="image" className="gap-2 font-accent text-xs"><ImagePlus className="w-4 h-4" /> Image</TabsTrigger>
                </TabsList>

                <TabsContent value="color">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-4">T-Shirt Color</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {TSHIRT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setTshirtColor(c.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            tshirtColor === c.value ? 'border-accent shadow-md' : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <span className="w-10 h-10 rounded-full border border-border" style={{ backgroundColor: c.value }} />
                          <span className="font-accent text-[10px] text-muted-foreground">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="font-accent text-xs">Text Content</Label>
                      <Input value={newText} onChange={(e) => { setNewText(e.target.value); if (activeTextId) updateActiveText({ text: e.target.value }); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-accent text-xs">Font</Label>
                        <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); updateActiveText({ fontFamily: e.target.value }); }}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-accent">
                          {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-accent text-xs">Text Color</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); updateActiveText({ color: e.target.value }); }}
                            className="w-10 h-10 rounded border-0 cursor-pointer" />
                          <span className="font-accent text-xs text-muted-foreground">{textColor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-accent text-xs">Font Size: {fontSize}px</Label>
                      <Slider value={[fontSize]} onValueChange={(v) => { setFontSize(v[0]); updateActiveText({ fontSize: v[0] }); }} min={12} max={72} step={1} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={bold ? 'default' : 'outline'} onClick={() => { setBold(!bold); updateActiveText({ bold: !bold }); }}><Bold className="w-4 h-4" /></Button>
                      <Button size="sm" variant={italic ? 'default' : 'outline'} onClick={() => { setItalic(!italic); updateActiveText({ italic: !italic }); }}><Italic className="w-4 h-4" /></Button>
                      <Button size="sm" variant={textAlign === 'left' ? 'default' : 'outline'} onClick={() => { setTextAlign('left'); updateActiveText({ align: 'left' }); }}><AlignLeft className="w-4 h-4" /></Button>
                      <Button size="sm" variant={textAlign === 'center' ? 'default' : 'outline'} onClick={() => { setTextAlign('center'); updateActiveText({ align: 'center' }); }}><AlignCenter className="w-4 h-4" /></Button>
                      <Button size="sm" variant={textAlign === 'right' ? 'default' : 'outline'} onClick={() => { setTextAlign('right'); updateActiveText({ align: 'right' }); }}><AlignRight className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addText} className="flex-1 font-accent text-sm gap-2"><Type className="w-4 h-4" /> Add Text</Button>
                      {activeTextId && (
                        <Button variant="destructive" onClick={removeActiveText} className="font-accent text-sm">Remove</Button>
                      )}
                    </div>
                    {textLayers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="font-accent text-xs text-muted-foreground">Text Layers</Label>
                        {textLayers.map((l) => (
                          <button key={l.id} onClick={() => { setActiveTextId(l.id); setNewText(l.text); setFontSize(l.fontSize); setTextColor(l.color); setFontFamily(l.fontFamily); setBold(l.bold); setItalic(l.italic); setTextAlign(l.align); }}
                            className={`w-full text-left p-2 rounded-lg text-sm font-accent transition-colors ${activeTextId === l.id ? 'bg-accent/10 text-accent' : 'bg-muted/50 text-foreground hover:bg-muted'}`}>
                            <Layers className="w-3 h-3 inline mr-2" />"{l.text}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="image">
                  <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                    <p className="font-body text-sm text-muted-foreground">Upload an image (PNG, JPG) to add to your design. Max 5MB.</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full gap-2 font-accent"><ImagePlus className="w-4 h-4" /> Upload Image</Button>
                    {imageLayers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="font-accent text-xs text-muted-foreground">Image Layers</Label>
                        {imageLayers.map((l, i) => (
                          <div key={l.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                            <span className="font-accent text-sm text-foreground">Image {i + 1}</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setImageLayers((p) => p.map((il) => il.id === l.id ? { ...il, width: il.width - 10, height: il.height - 10 } : il))}><Minus className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => setImageLayers((p) => p.map((il) => il.id === l.id ? { ...il, width: il.width + 10, height: il.height + 10 } : il))}><Plus className="w-3 h-3" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => setImageLayers((p) => p.filter((il) => il.id !== l.id))} className="text-xs">×</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Move className="w-4 h-4" />
                      <span className="font-accent text-xs">Drag elements on the canvas to reposition</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Canvas Preview */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-4">
              <div className="bg-muted/30 rounded-2xl border border-border p-6 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  className="cursor-move rounded-lg"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>

              {/* Print Position Selector */}
              <div className="w-full bg-card rounded-xl border border-border p-4">
                <h4 className="font-accent text-xs font-semibold text-foreground mb-3">Print Position</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PRINT_POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPrintPosition(pos.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        printPosition === pos.id 
                          ? 'border-accent bg-accent/10' 
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <span className="font-accent text-xs font-medium text-foreground block">{pos.label}</span>
                      <span className="font-body text-[10px] text-muted-foreground">{pos.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="w-full bg-card rounded-xl border border-border p-4">
                <h4 className="font-accent text-xs font-semibold text-foreground mb-3">Select Size</h4>
                <div className="flex gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-2.5 rounded-lg border-2 font-accent text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-accent bg-accent text-accent-foreground' 
                          : 'border-border text-foreground hover:border-muted-foreground/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={handleReset} className="gap-2 font-accent text-sm flex-1">
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
                <Button variant="outline" onClick={handleDownload} className="gap-2 font-accent text-sm flex-1">
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>

              <Button onClick={handleAddToCart} className="w-full py-3.5 rounded-xl font-accent font-semibold text-sm bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                Add to Cart — ₹799
              </Button>
              <p className="font-body text-xs text-muted-foreground text-center">Custom designed t-shirts are printed on premium 180 GSM cotton</p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DesignerPage;
