<template>
  <div>
    <!-- Modal principal de Producto (crear/editar) -->
    <Teleport to="body">
      <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
        <form @submit.prevent="guardarProducto" class="bg-white rounded-[24px] w-[95vw] max-w-5xl shadow-2xl relative animate-fade-up border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03] z-20"></div>
          <button type="button" @click="cerrarModalProducto" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition z-10">
            <i class="pi pi-times text-xl"></i>
          </button>

          <div class="p-6 md:p-8 pb-4 border-b border-gray-100 text-left pr-16">
            <h2 class="text-2xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <p class="text-gray-400 font-medium text-sm">Complete los datos del producto</p>
          </div>

          <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 md:space-y-6 text-left">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
                <InputText v-model="productoForm.nombre" class="w-full border border-gray-200 rounded-xl p-3 focus:border-[#003d00]" :class="{ 'border-red-500': errors.nombre }" />
                <small class="text-red-500">{{ errors.nombre }}</small>
              </div>

              <!-- Sección -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  <i class="pi pi-tags mr-1 text-[#034e03]"></i> Sección *
                </label>
                <Dropdown
                  v-model="productoForm.seccion"
                  :options="secciones"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccionar sección"
                  class="w-full border border-gray-200 rounded-xl"
                  :class="{ 'border-red-500': errors.seccion }"
                />
                <small class="text-red-500">{{ errors.seccion }}</small>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{'text-gray-400': !productoForm.seccion && !esEdicion}">
                  <i class="pi pi-tags mr-1" :class="!productoForm.seccion && !esEdicion ? 'text-gray-400' : 'text-[#034e03]'"></i> Categoría *
                </label>
                <div class="flex gap-2">
                  <Dropdown
                    v-model="productoForm.categoria_id"
                    :options="categoriasFiltradas"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="flex-1 border border-gray-200 rounded-xl"
                    :class="{ 'border-red-500': errors.categoria_id }"
                    :disabled="!productoForm.seccion && !esEdicion"
                  />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('categoria')" :disabled="!productoForm.seccion && !esEdicion" />
                </div>
                <small class="text-red-500">{{ errors.categoria_id }}</small>
              </div>

              <!-- Marca -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{'text-gray-400': !productoForm.seccion && !esEdicion}">
                  <i class="pi pi-bookmark mr-1" :class="!productoForm.seccion && !esEdicion ? 'text-gray-400' : 'text-[#034e03]'"></i> Marca *
                </label>
                <div class="flex gap-2">
                  <Dropdown
                    v-model="productoForm.marca_id"
                    :options="marcasFiltradas"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="flex-1 border border-gray-200 rounded-xl"
                    :class="{ 'border-red-500': errors.marca_id }"
                    :disabled="!productoForm.seccion && !esEdicion"
                  />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('marca')" :disabled="!productoForm.seccion && !esEdicion" />
                </div>
                <small class="text-red-500">{{ errors.marca_id }}</small>
              </div>

              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Detalle ($) *</label>
                <InputNumber v-model="productoForm.precio_detalle" mode="currency" currency="USD" locale="en-US" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_detalle }" />
                <small class="text-red-500">{{ errors.precio_detalle }}</small>
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Mayorista ($) *</label>
                <InputNumber v-model="productoForm.precio_mayor" mode="currency" currency="USD" locale="en-US" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_mayor }" />
                <small class="text-red-500">{{ errors.precio_mayor }}</small>
              </div>
              <div>
                <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                  <i class="pi pi-exclamation-triangle text-amber-600 text-sm"></i>
                  <span class="text-amber-700">Stock Mínimo *</span>
                </label>
                <InputNumber v-model="productoForm.stock_minimo" :min="1" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.stock_minimo }" />
                <small class="text-red-500">{{ errors.stock_minimo }}</small>
              </div>

              <!-- Cantidad Inicial (Solo en Creación y NO Perecedero) -->
              <div v-if="!esEdicion && !productoForm.perecedero">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Cantidad Inicial *</label>
                <InputNumber v-model="productoForm.cantidad_inicial" :min="1" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.cantidad_inicial }" />
                <small class="text-red-500">{{ errors.cantidad_inicial }}</small>
              </div>

              <!-- Cantidad Total Calculada (Solo en Creación y Perecedero) -->
              <div v-if="!esEdicion && productoForm.perecedero">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Stock Total Inicial (Sumatoria de Lotes)</label>
                <div class="w-full border border-green-200 rounded-xl p-3 bg-green-50/50 text-[#003d00] font-black text-base flex items-center justify-between">
                  <span>{{ totalStockCalculado }} uds.</span>

                </div>
              </div>

              <!-- Campo Stock en Edición -->
              <div v-if="esEdicion">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  Stock Actual
                </label>

                <!-- Mostrar stock actual + botón abrir modal -->
                <div class="flex items-center gap-3">
                  <div class="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 font-bold text-gray-700 text-sm">
                    {{ stockVisualProyectado !== null ? stockVisualProyectado : productoForm.stock_actual }}
                  </div>
                  <button
                    type="button"
                    @click="abrirModalAjusteStock"
                    class="px-3 py-2 rounded-xl border text-xs font-extrabold uppercase tracking-wide transition flex items-center gap-1.5 shrink-0 bg-[#003d00]/10 text-[#003d00] border-[#003d00]/20 hover:bg-[#003d00]/20"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                    Modificar Stock
                  </button>
                </div>
              </div>
            </div>

            <!-- Sección de Agregar Nuevo Lote en Edición (Solo para Perecederos) -->
            <div v-if="esEdicion && productoForm.perecedero" class="border-t border-gray-200 pt-4 mt-4 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-black text-[#003d00] uppercase tracking-wider flex items-center gap-2">
                    <i class="pi pi-box text-[#034e03]"></i> ¿Desea agregar un nuevo lote?
                  </h3>
                  <p class="text-xs text-gray-400">Si olvidó incluir un lote en la recepción, puede añadirlo aquí.</p>
                </div>
                <button
                  type="button"
                  @click="toggleAgregarNuevoLoteEdicion"
                  :class="agregarLoteEdicionActivo ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' : 'bg-[#003d00] text-white hover:bg-[#002800]'"
                  class="px-3 py-2 rounded-xl border text-xs font-extrabold uppercase tracking-wide transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <i :class="agregarLoteEdicionActivo ? 'pi pi-times' : 'pi pi-plus'" class="text-xs"></i>
                  {{ agregarLoteEdicionActivo ? 'Cancelar Nuevo Lote' : 'Agregar Nuevo Lote' }}
                </button>
              </div>

              <div v-if="agregarLoteEdicionActivo" class="p-4 bg-green-50/60 rounded-2xl border border-green-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div class="md:col-span-5">
                  <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                    Código de Nuevo Lote *
                  </label>
                  <InputText
                    v-model="nuevoLoteEdicion.codigo_lote"
                    @input="nuevoLoteEdicion.codigo_lote = nuevoLoteEdicion.codigo_lote.toUpperCase()"
                    placeholder="Ej. LOT-2026-002"
                    class="w-full border border-gray-200 rounded-xl p-2.5 uppercase"
                    :class="{ 'border-red-500': errors['nuevo_lote.codigo_lote'] }"
                  />
                  <small v-if="errors['nuevo_lote.codigo_lote']" class="text-red-500 text-[11px] block mt-0.5">
                    {{ errors['nuevo_lote.codigo_lote'] }}
                  </small>
                </div>

                <div class="md:col-span-4">
                  <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                    Fecha Vencimiento *
                  </label>
                  <Calendar
                    v-model="nuevoLoteEdicion.fecha_vencimiento"
                    :minDate="fechaMinima"
                    dateFormat="yy-mm-dd"
                    placeholder="YYYY-MM-DD"
                    class="w-full"
                    :class="{ 'border-red-500': errors['nuevo_lote.fecha_vencimiento'] }"
                  />
                  <small v-if="errors['nuevo_lote.fecha_vencimiento']" class="text-red-500 text-[11px] block mt-0.5">
                    {{ errors['nuevo_lote.fecha_vencimiento'] }}
                  </small>
                </div>

                <div class="md:col-span-3">
                  <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                    Cantidad Inicial *
                  </label>
                  <InputNumber
                    v-model="nuevoLoteEdicion.cantidad"
                    :min="1"
                    class="w-full border border-gray-200 rounded-xl p-2.5"
                    :class="{ 'border-red-500': errors['nuevo_lote.cantidad'] }"
                  />
                  <small v-if="errors['nuevo_lote.cantidad']" class="text-red-500 text-[11px] block mt-0.5">
                    {{ errors['nuevo_lote.cantidad'] }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Lista Dinámica de Lotes para Perecederos (Solo Creación) -->
            <div v-if="!esEdicion && productoForm.perecedero" class="border-t border-gray-200 pt-4 md:pt-6 mt-4 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-md font-extrabold text-[#003d00] uppercase tracking-wide">Lotes del Producto*</h3>
                </div>
                <button
                  type="button"
                  @click="agregarLoteCreacion"
                  class="px-3 py-2 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <i class="pi pi-plus text-xs"></i> Agregar Lote
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(loteItem, index) in lotesCreacion"
                  :key="'lote-row-' + index"
                  class="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div class="md:col-span-4">
                    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                      Código de Lote #{{ index + 1 }} *
                    </label>
                    <InputText
                      v-model="loteItem.codigo_lote"
                      @input="loteItem.codigo_lote = loteItem.codigo_lote.toUpperCase()"
                      placeholder="Ej. LOT-2026-001"
                      class="w-full border border-gray-200 rounded-xl p-2.5 uppercase"
                      :class="{ 'border-red-500': errors[`lotes.${index}.codigo_lote`] }"
                    />
                    <small v-if="errors[`lotes.${index}.codigo_lote`]" class="text-red-500 text-[11px] block mt-0.5">
                      {{ errors[`lotes.${index}.codigo_lote`] }}
                    </small>
                  </div>

                  <div class="md:col-span-4">
                    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                      Fecha Vencimiento *
                    </label>
                    <Calendar
                      v-model="loteItem.fecha_vencimiento"
                      :minDate="fechaMinima"
                      dateFormat="yy-mm-dd"
                      placeholder="YYYY-MM-DD"
                      class="w-full"
                      :class="{ 'border-red-500': errors[`lotes.${index}.fecha_vencimiento`] }"
                    />
                    <small v-if="errors[`lotes.${index}.fecha_vencimiento`]" class="text-red-500 text-[11px] block mt-0.5">
                      {{ errors[`lotes.${index}.fecha_vencimiento`] }}
                    </small>
                  </div>

                  <div class="md:col-span-3">
                    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">
                      Cant. *
                    </label>
                    <InputNumber
                      v-model="loteItem.cantidad"
                      :min="1"
                      class="w-full border border-gray-200 rounded-xl p-2.5"
                      :class="{ 'border-red-500': errors[`lotes.${index}.cantidad`] }"
                    />
                    <small v-if="errors[`lotes.${index}.cantidad`]" class="text-red-500 text-[11px] block mt-0.5">
                      {{ errors[`lotes.${index}.cantidad`] }}
                    </small>
                  </div>

                  <div class="md:col-span-1 flex justify-center pt-5">
                    <button
                      type="button"
                      @click="quitarLoteCreacion(index)"
                      :disabled="lotesCreacion.length <= 1"
                      class="w-10 h-10 rounded-xl flex items-center justify-center transition border shrink-0"
                      :class="lotesCreacion.length > 1 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'"
                      title="Eliminar este lote"
                    >
                      <i class="pi pi-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 pt-4 border-t border-gray-200 flex items-center gap-4 bg-gray-50/50 rounded-b-[24px]">
            <button type="button" @click="cerrarModalProducto" class="px-8 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition">Cancelar</button>
            <button type="button" @click="solicitarConfirmacionGuardado" :disabled="loading" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
              {{ loading ? 'GUARDANDO...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>



    <!-- Submodal para Modificar Stock -->
    <Teleport to="body">
      <div v-if="subModal.ajusteStock" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[115] backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#003d00]"></div>

          <div class="p-6 md:p-8 text-left">
            <h3 class="text-xl font-extrabold text-[#003d00] mb-1 flex items-center gap-2">
              <i class="pi pi-[#003d00] pi-sliders-h text-lg"></i> Modificar Stock
            </h3>
            <p class="text-xs text-gray-400 font-medium mb-6">Ajuste la cantidad del producto y especifique el motivo.</p>

            <div class="space-y-4">
              <!-- Selección de Lote para Perecederos -->
              <div v-if="productoForm.perecedero">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  1. Seleccionar Lote a Afectar *
                </label>
                <Dropdown
                  v-model="productoForm.lote_id"
                  :options="lotesDisponibles"
                  optionLabel="label"
                  optionValue="id"
                  placeholder="Seleccionar Lote"
                  class="w-full border border-gray-200 rounded-xl"
                  :class="{ 'border-red-500': errors.lote_id }"
                />
                <small v-if="errors.lote_id" class="text-red-500 text-xs block mt-1">{{ errors.lote_id }}</small>
              </div>

              <!-- Nuevo Stock -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  {{ productoForm.perecedero ? '2. Nuevo Stock del Lote *' : '1. Nuevo Stock Total *' }}
                </label>
                <InputNumber
                  v-model="productoForm.nuevo_stock"
                  :min="0"
                  class="w-full border border-gray-200 rounded-xl p-3"
                  :class="{ 'border-red-500': errors.nuevo_stock }"
                />
                <small v-if="errors.nuevo_stock" class="text-red-500 text-xs block mt-1">{{ errors.nuevo_stock }}</small>
              </div>

              <!-- Motivo de Ajuste -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  {{ productoForm.perecedero ? '3. Motivo del Ajuste *' : '2. Motivo del Ajuste *' }}
                </label>
                <InputText
                  v-model="productoForm.motivo_ajuste"
                  placeholder="Ej. Conteo físico de inventario, merma, etc."
                  class="w-full border border-gray-200 rounded-xl p-3"
                  :class="{ 'border-red-500': errors.motivo_ajuste }"
                />
                <small v-if="errors.motivo_ajuste" class="text-red-500 text-xs block mt-1">{{ errors.motivo_ajuste }}</small>
              </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button
                type="button"
                @click="cerrarModalAjusteStock"
                class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition border border-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="confirmarAjusteStockModal"
                class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-md transition"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Submodal para crear categoría -->
    <Teleport to="body">
      <div v-if="subModal.categoria" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <div class="p-8">
            <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Categoría</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
                <InputText v-model="nuevaCategoria.nombre" placeholder="Nombre de categoría" class="w-full border border-gray-200 rounded-xl p-3" />
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Sección *</label>
                <Dropdown v-model="nuevaCategoria.seccion" :options="secciones" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl bg-gray-100" disabled />
              </div>
            </div>
            <div class="flex gap-3 mt-8">
              <button @click="cerrarSubModal('categoria')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
              <button @click="crearCategoriaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Submodal para crear marca -->
    <Teleport to="body">
      <div v-if="subModal.marca" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <div class="p-8">
            <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Marca</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
                <InputText v-model="nuevaMarca.nombre" placeholder="Nombre de marca" class="w-full border border-gray-200 rounded-xl p-3" />
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Sección *</label>
                <Dropdown v-model="nuevaMarca.seccion" :options="secciones" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl bg-gray-100" disabled />
              </div>
            </div>
            <div class="flex gap-3 mt-8">
              <button @click="cerrarSubModal('marca')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
              <button @click="crearMarcaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Swal from 'sweetalert2'
import { useProductoStore } from '@/stores/productoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useMarcaStore } from '@/stores/marcaStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

const props = defineProps({
  visible: { type: Boolean, required: true },
  productoAEditar: { type: Object, default: null },
  esEdicion: { type: Boolean, required: true },
  tipoPerecedero: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'guardado', 'toast'])

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

const loading = ref(false)
const errors = ref({})
const subModal = ref({ categoria: false, marca: false, ajusteStock: false })
const nuevaCategoria = ref({ nombre: '', seccion: '' })
const nuevaMarca = ref({ nombre: '', seccion: '' })
const modificarStock = ref(false)

const agregarLoteEdicionActivo = ref(false)
const nuevoLoteEdicion = ref({
  codigo_lote: '',
  fecha_vencimiento: null,
  cantidad: 1
})

const toggleAgregarNuevoLoteEdicion = () => {
  agregarLoteEdicionActivo.value = !agregarLoteEdicionActivo.value
  if (!agregarLoteEdicionActivo.value) {
    nuevoLoteEdicion.value = { codigo_lote: '', fecha_vencimiento: null, cantidad: 1 }
  }
}

const lotesCreacion = ref([
  { codigo_lote: '', fecha_vencimiento: null, cantidad: 1 }
])

const agregarLoteCreacion = () => {
  lotesCreacion.value.push({ codigo_lote: '', fecha_vencimiento: null, cantidad: 1 })
}

const quitarLoteCreacion = (index) => {
  if (lotesCreacion.value.length > 1) {
    lotesCreacion.value.splice(index, 1)
  }
}

const totalStockCalculado = computed(() => {
  return lotesCreacion.value.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0)
})

const abrirModalAjusteStock = () => {
  subModal.value.ajusteStock = true
  modificarStock.value = true
  if (productoForm.value.perecedero) {
    productoForm.value.lote_id = null
    productoForm.value.nuevo_stock = null
  } else {
    productoForm.value.nuevo_stock = productoForm.value.stock_actual
  }
}

const cerrarModalAjusteStock = () => {
  subModal.value.ajusteStock = false
  if (productoForm.value.nuevo_stock === null || productoForm.value.nuevo_stock === productoForm.value.stock_actual) {
    modificarStock.value = false
    productoForm.value.nuevo_stock = productoForm.value.stock_actual
    productoForm.value.motivo_ajuste = ''
    productoForm.value.lote_id = null
  }
}

const confirmarAjusteStockModal = () => {
  errors.value.nuevo_stock = null
  errors.value.motivo_ajuste = null
  errors.value.lote_id = null

  let tieneError = false
  if (productoForm.value.nuevo_stock === null || productoForm.value.nuevo_stock < 0) {
    errors.value.nuevo_stock = 'Ingrese un valor de stock válido.'
    tieneError = true
  } else if (productoForm.value.perecedero && productoForm.value.lote_id) {
    const loteAfectado = productoForm.value.lotes.find(l => l.id === productoForm.value.lote_id)
    if (loteAfectado && productoForm.value.nuevo_stock === loteAfectado.cantidad_actual) {
      errors.value.nuevo_stock = 'El nuevo stock debe ser diferente a la cantidad actual del lote (' + loteAfectado.cantidad_actual + ').'
      tieneError = true
    }
  } else if (!productoForm.value.perecedero && productoForm.value.nuevo_stock === productoForm.value.stock_actual) {
    errors.value.nuevo_stock = 'El nuevo stock debe ser diferente al stock actual (' + productoForm.value.stock_actual + ').'
    tieneError = true
  }

  if (productoForm.value.perecedero && !productoForm.value.lote_id) {
    errors.value.lote_id = 'Debe seleccionar el lote a afectar.'
    tieneError = true
  }
  if (!productoForm.value.motivo_ajuste || productoForm.value.motivo_ajuste.trim().length < 4) {
    errors.value.motivo_ajuste = 'Ingrese un motivo de ajuste válido (mín. 4 caracteres).'
    tieneError = true
  }

  if (!tieneError) {
    if (productoForm.value.perecedero && productoForm.value.lote_id) {
      const loteAfectado = productoForm.value.lotes.find(l => l.id === productoForm.value.lote_id)
      if (loteAfectado) {
        const diferencia = productoForm.value.nuevo_stock - loteAfectado.cantidad_actual
        stockVisualProyectado.value = stockOriginalBase.value + diferencia
      }
    } else {
      stockVisualProyectado.value = productoForm.value.nuevo_stock
    }
    modificarStock.value = true
    subModal.value.ajusteStock = false
  }
}

const secciones = [
  { label: 'Tienda', value: 'TIENDA', icono: 'pi pi-shopping-cart' },
  { label: 'Librería', value: 'LIBRERIA', icono: 'pi pi-book' },
  { label: 'Medicamentos', value: 'MEDICAMENTO', icono: 'pi pi-heart' }
]

const productoForm = ref({
  id: null,
  nombre: '',
  categoria_id: null,
  marca_id: null,
  precio_detalle: null,
  precio_mayor: null,
  stock_minimo: 1,
  perecedero: false,
  cantidad_inicial: 1,
  seccion: '',
  stock_actual: 0,
  nuevo_stock: null,
  motivo_ajuste: '',
  lote_id: null,
  lotes: []
})

const initialForm = () => ({
  id: null, nombre: '', categoria_id: null, marca_id: null,
  precio_detalle: null, precio_mayor: null, stock_minimo: 1, perecedero: false,
  cantidad_inicial: 1, seccion: '', stock_actual: 0, nuevo_stock: null, motivo_ajuste: '', lote_id: null, lotes: []
})

const stockOriginalBase = ref(0)
const stockVisualProyectado = ref(null)

const resetForm = () => {
  productoForm.value = initialForm()
  lotesCreacion.value = [{ codigo_lote: '', fecha_vencimiento: null, cantidad: 1 }]
  agregarLoteEdicionActivo.value = false
  nuevoLoteEdicion.value = { codigo_lote: '', fecha_vencimiento: null, cantidad: 1 }
  errors.value = {}
  modificarStock.value = false
  stockOriginalBase.value = 0
  stockVisualProyectado.value = null
}

const initializeForm = (producto) => {
  if (producto) {
    productoForm.value = {
      id: producto.id,
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      marca_id: producto.marca_id,
      precio_detalle: Number(producto.precio_detalle),
      precio_mayor: Number(producto.precio_mayor),
      stock_minimo: producto.stock_minimo,
      perecedero: producto.perecedero === 'PERECEDERO',
      cantidad_inicial: 1,
      seccion: producto.seccion,
      stock_actual: producto.stock,
      nuevo_stock: null,
      motivo_ajuste: '',
      lote_id: null,
      lotes: producto.lotes || []
    }
    stockOriginalBase.value = producto.stock || 0
    stockVisualProyectado.value = null
    modificarStock.value = false
    agregarLoteEdicionActivo.value = false
    nuevoLoteEdicion.value = { codigo_lote: '', fecha_vencimiento: null, cantidad: 1 }
  } else {
    resetForm()
    productoForm.value.perecedero = props.tipoPerecedero
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initializeForm(props.productoAEditar)
    } else {
      resetForm()
    }
  }
)

watch(
  () => productoForm.value.seccion,
  (nuevaSeccion, viejaSeccion) => {
    if (viejaSeccion && nuevaSeccion !== viejaSeccion) {
      productoForm.value.categoria_id = null
      productoForm.value.marca_id = null
    }
  }
)

watch(
  () => productoForm.value.lote_id,
  (newLoteId) => {
    if (newLoteId && modificarStock.value && productoForm.value.perecedero) {
      const lote = productoForm.value.lotes.find(l => l.id === newLoteId)
      if (lote) productoForm.value.nuevo_stock = lote.cantidad_actual
    }
  }
)

const fechaMinima = computed(() => {
  const mañana = new Date()
  mañana.setDate(mañana.getDate() + 1)
  return mañana
})

const lotesDisponibles = computed(() => {
  if (!productoForm.value.lotes) return []
  const hoy = new Date().toISOString().split('T')[0]
  return productoForm.value.lotes.map(l => {
    const fechaSolo = l.fecha_vencimiento ? String(l.fecha_vencimiento).split('T')[0] : ''
    let tag = ''
    if (l.cantidad_actual <= 0 || l.estado === 'INACTIVO') {
      tag = ' - AGOTADO'
    } else if (fechaSolo && fechaSolo < hoy) {
      tag = ' - VENCIDO'
    }
    return {
      id: l.id,
      label: `${l.codigo_lote} (Disp: ${l.cantidad_actual} | Vence: ${fechaSolo})${tag}`
    }
  })
})

const categorias = computed(() => categoriaStore.categorias || [])
const marcas = computed(() => marcaStore.marcas || [])

const categoriasFiltradas = computed(() => {
  if (!productoForm.value.seccion) return categorias.value
  return categorias.value.filter(c => c.seccion === productoForm.value.seccion)
})

const marcasFiltradas = computed(() => {
  if (!productoForm.value.seccion) return marcas.value
  return marcas.value.filter(m => m.seccion === productoForm.value.seccion)
})

const cerrarModalProducto = () => {
  emit('update:visible', false)
}

const solicitarConfirmacionGuardado = async () => {
  errors.value = {}

  // Validaciones locales previas a la confirmación
  if (!productoForm.value.nombre || !productoForm.value.nombre.trim()) {
    errors.value.nombre = 'El nombre del producto es obligatorio.'
  }
  if (!productoForm.value.categoria_id) {
    errors.value.categoria_id = 'La categoría es obligatoria.'
  }
  if (!productoForm.value.marca_id) {
    errors.value.marca_id = 'La marca es obligatoria.'
  }
  if (!productoForm.value.precio_detalle || productoForm.value.precio_detalle <= 0) {
    errors.value.precio_detalle = 'El precio detalle debe ser mayor a 0.'
  }
  if (!productoForm.value.precio_mayor || productoForm.value.precio_mayor <= 0) {
    errors.value.precio_mayor = 'El precio mayor debe ser mayor a 0.'
  } else if (productoForm.value.precio_detalle && productoForm.value.precio_mayor >= productoForm.value.precio_detalle) {
    errors.value.precio_mayor = 'El precio mayorista debe ser menor que el precio detalle.'
  }
  if (!productoForm.value.stock_minimo || productoForm.value.stock_minimo < 1) {
    errors.value.stock_minimo = 'El stock mínimo debe ser al menos 1.'
  }

  if (props.esEdicion) {
    if (modificarStock.value && productoForm.value.nuevo_stock !== null && productoForm.value.nuevo_stock !== productoForm.value.stock_actual) {
      if (!productoForm.value.motivo_ajuste || productoForm.value.motivo_ajuste.trim().length < 4) {
        errors.value.motivo_ajuste = 'El motivo del ajuste debe tener al menos 4 caracteres.'
      }
      if (productoForm.value.perecedero && !productoForm.value.lote_id) {
        errors.value.lote_id = 'Debe seleccionar un lote para el producto perecedero.'
      }
    }
    if (agregarLoteEdicionActivo.value) {
      if (!nuevoLoteEdicion.value.codigo_lote || !nuevoLoteEdicion.value.codigo_lote.trim()) {
        errors.value['nuevo_lote.codigo_lote'] = 'El código del nuevo lote es obligatorio.'
      }
      if (!nuevoLoteEdicion.value.fecha_vencimiento) {
        errors.value['nuevo_lote.fecha_vencimiento'] = 'La fecha de vencimiento es obligatoria.'
      }
    }
  } else {
    if (productoForm.value.perecedero) {
      const codigosVistos = new Set()
      lotesCreacion.value.forEach((l, idx) => {
        if (!l.codigo_lote || !l.codigo_lote.trim()) {
          errors.value[`lotes.${idx}.codigo_lote`] = 'El código de lote es obligatorio.'
        } else if (codigosVistos.has(l.codigo_lote.trim().toUpperCase())) {
          errors.value[`lotes.${idx}.codigo_lote`] = 'Código de lote duplicado en el formulario.'
        } else {
          codigosVistos.add(l.codigo_lote.trim().toUpperCase())
        }

        if (!l.fecha_vencimiento) {
          errors.value[`lotes.${idx}.fecha_vencimiento`] = 'La fecha de vencimiento es obligatoria.'
        }
      })
    }
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  const result = await Swal.fire({
    title: '¿Guardar Cambios?',
    text: props.esEdicion ? 'Se actualizará la información del producto.' : 'Se creará el nuevo producto.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#003d00',
    cancelButtonColor: '#d6dfd6',
    confirmButtonText: 'Sí, Guardar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    await guardarProducto()
  }
}

const guardarProducto = async () => {
  errors.value = {}
  loading.value = true

  const data = {
    nombre: productoForm.value.nombre,
    categoria_id: productoForm.value.categoria_id,
    marca_id: productoForm.value.marca_id,
    precio_detalle: productoForm.value.precio_detalle,
    precio_mayor: productoForm.value.precio_mayor,
    stock_minimo: productoForm.value.stock_minimo,
    perecedero: productoForm.value.perecedero ? 'PERECEDERO' : 'NORMAL',
    seccion: productoForm.value.seccion
  }

  if (props.esEdicion) {
    if (modificarStock.value && productoForm.value.nuevo_stock !== null && productoForm.value.nuevo_stock !== productoForm.value.stock_actual) {
      data.nuevo_stock = productoForm.value.nuevo_stock
      data.motivo_ajuste = productoForm.value.motivo_ajuste
      if (productoForm.value.perecedero) {
        data.lote_id = productoForm.value.lote_id
      }
    }
    if (agregarLoteEdicionActivo.value && nuevoLoteEdicion.value.codigo_lote) {
      data.nuevo_lote = {
        codigo_lote: nuevoLoteEdicion.value.codigo_lote.trim().toUpperCase(),
        fecha_vencimiento: nuevoLoteEdicion.value.fecha_vencimiento instanceof Date
          ? nuevoLoteEdicion.value.fecha_vencimiento.toISOString().split('T')[0]
          : nuevoLoteEdicion.value.fecha_vencimiento,
        cantidad: nuevoLoteEdicion.value.cantidad
      }
    }
  } else {
    if (productoForm.value.perecedero) {
      data.lotes = lotesCreacion.value.map(l => ({
        codigo_lote: l.codigo_lote.trim().toUpperCase(),
        fecha_vencimiento: l.fecha_vencimiento instanceof Date
          ? l.fecha_vencimiento.toISOString().split('T')[0]
          : l.fecha_vencimiento,
        cantidad: l.cantidad
      }))
    } else {
      data.cantidad_inicial = productoForm.value.cantidad_inicial
    }
  }

  try {
    if (props.esEdicion) {
      await productoStore.updateProducto(productoForm.value.id, data)
      cerrarModalProducto()
      emit('guardado')
      emit('toast', { tipo: 'success', mensaje: 'Producto actualizado con éxito' })
    } else {
      await productoStore.createProducto(data)
      cerrarModalProducto()
      emit('guardado')
      emit('toast', { tipo: 'success', mensaje: 'Producto guardado con éxito' })
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const resData = error.response.data || {}
      if (resData.errors && Object.keys(resData.errors).length > 0) {
        errors.value = {}
        for (const key in resData.errors) {
          errors.value[key] = Array.isArray(resData.errors[key]) ? resData.errors[key][0] : resData.errors[key]
        }
      }
      if (resData.message) {
        emit('toast', { tipo: 'error', mensaje: resData.message })
      }
    } else {
      const msg = error.response?.data?.message || 'Ocurrió un error inesperado al guardar el producto.'
      emit('toast', { tipo: 'error', mensaje: msg })
    }
  } finally {
    loading.value = false
  }
}

const abrirSubModal = (tipo) => {
  subModal.value[tipo] = true
  if (tipo === 'categoria') nuevaCategoria.value.seccion = productoForm.value.seccion
  if (tipo === 'marca') nuevaMarca.value.seccion = productoForm.value.seccion
}

const cerrarSubModal = (tipo) => {
  subModal.value[tipo] = false
  if (tipo === 'categoria') nuevaCategoria.value = { nombre: '', seccion: '' }
  if (tipo === 'marca') nuevaMarca.value = { nombre: '', seccion: '' }
}

const crearCategoriaDesdeSub = async () => {
  if (!nuevaCategoria.value.nombre) {
    emit('toast', { tipo: 'error', mensaje: 'El nombre de la categoría es obligatorio.' })
    return
  }
  try {
    await categoriaStore.createCategoria({ nombre: nuevaCategoria.value.nombre, seccion: nuevaCategoria.value.seccion })
    await categoriaStore.fetchCategorias({ per_page: 9999 })
    const nueva = categoriaStore.categorias.find(c => c.nombre === nuevaCategoria.value.nombre)
    productoForm.value.categoria_id = nueva?.id ?? categoriaStore.categorias[categoriaStore.categorias.length - 1]?.id
    cerrarSubModal('categoria')
    emit('toast', { tipo: 'success', mensaje: 'Categoría creada correctamente.' })
  } catch (error) {
    let msg = 'Error al crear categoría.'
    if (error.response?.status === 422) {
      const valErrors = error.response.data.errors || error.response.data.error
      if (valErrors) {
        const first = Object.values(valErrors)[0]
        msg = Array.isArray(first) ? first[0] : (first || msg)
      }
    } else {
      msg = error.response?.data?.message || msg
    }
    emit('toast', { tipo: 'error', mensaje: msg })
  }
}

const crearMarcaDesdeSub = async () => {
  if (!nuevaMarca.value.nombre) {
    emit('toast', { tipo: 'error', mensaje: 'El nombre de la marca es obligatorio.' })
    return
  }
  try {
    await marcaStore.createMarca({ nombre: nuevaMarca.value.nombre, seccion: nuevaMarca.value.seccion })
    await marcaStore.fetchMarcas({ per_page: 9999 })
    const nueva = marcaStore.marcas.find(m => m.nombre === nuevaMarca.value.nombre)
    productoForm.value.marca_id = nueva?.id ?? marcaStore.marcas[marcaStore.marcas.length - 1]?.id
    cerrarSubModal('marca')
    emit('toast', { tipo: 'success', mensaje: 'Marca creada correctamente.' })
  } catch (error) {
    let msg = 'Error al crear marca.'
    if (error.response?.status === 422) {
      const valErrors = error.response.data.errors || error.response.data.error
      if (valErrors) {
        const first = Object.values(valErrors)[0]
        msg = Array.isArray(first) ? first[0] : (first || msg)
      }
    } else {
      msg = error.response?.data?.message || msg
    }
    emit('toast', { tipo: 'error', mensaje: msg })
  }
}
</script>

<style scoped>
.animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
:deep(.p-calendar) { width: 100%; }
:deep(.p-calendar .p-inputtext) { width: 100%; padding: 0.75rem; }
</style>
